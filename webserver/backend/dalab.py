'''
PuckLab webapp!

Uses python(flask) and mongo db
'''

from flask import Flask, send_from_directory, request
from flask.ext.pymongo import PyMongo
import os
import sys
import display.page as page
import display.search as search

app = Flask(__name__)

app.config['MONGO_DBNAME'] = 'dalab'
mongo = PyMongo(app)

@app.route('/javascript/<path:path>')
def sendJavascript(path):
    return send_from_directory('../javascript', path)


@app.route('/style/<path:path>')
def sendStyle(path):
    return send_from_directory('../style', path)


@app.route('/fonts/<path:path>')
def sendFont(path):
    return send_from_directory('../fonts', path)

# The index page (all the posts and apps)
@app.route('/')
def index():

    s = search.Search()

    p = page.Page()
    p.content = s.render(mongo,"","","Lastest From DaLab")

    return p.render()

# The search page
@app.route('/search')
def sendSearchResults():

    s = search.Search()

    p = page.Page()
    p.nav.search = request.query_string
    p.content = s.render(mongo,request.query_string,request.args)

    return p.render()

# The raw search results
@app.route('/rawsearch')
def sendRawSearchResults():

    s = search.Search()

    return s.render(mongo,request.query_string,request.args)

# The posts page
@app.route('/posts')
def postResults():

    s = search.Search()

    p = page.Page()

    queryString = "type=post"
    queryArgs = {"type":"post"}
    p.nav.search = queryString
    p.content = s.render(mongo,queryString,queryArgs, "Posts")

    return p.render()

# The posts page
@app.route('/apps')
def appResults():

    s = search.Search()

    p = page.Page()

    queryString = "type=app"
    queryArgs = {"type":"app"}
    p.nav.search = queryString
    p.content = s.render(mongo,queryString,queryArgs,"Apps")

    return p.render()

#Get a tag
@app.route('/tag/<tag>')
def tagSearch(tag):

    s = search.Search()

    p = page.Page()

    queryString = "tags=" + tag
    queryArgs = {"tags":tag}
    p.nav.search = queryString
    p.content = s.render(mongo,queryString,queryArgs,"Tag: " + tag)

    return p.render()


# Serve a post
@app.route("/post/<postName>")
def postView(postName):

    # The id is post_<postname>
    id = "post_" + postName

    # Find the post in the mongo
    results = mongo.db.pages.find_one({"_id":id})

    # Check if the config is found in the db
    if (results == None):
        p = page.Page()
        message = "Post %s not found" % (postName)
        return p.renderError(message)

    # Cool. The config was found in the db
    p = page.Page()

    # Setup (and verify) the page
    goodConfig = p.loadConfig(results)

    # The page is no good
    if(not goodConfig):
        p = page.Page()
        message = "Page config for: %s is no good" % (postName)
        return p.renderError(message)

    # Set up the content
    if('content' not in results):
        p = page.Page()
        message = "Page content for: %s is not found" % (postName)
        return p.renderError(message)

    p.content = results['content']

    # Render the page
    return p.render()

# Serve the app it self
@app.route("/app/<appName>")
def appView(appName):

    # The id is app_<appName>
    id = "app_" + appName

    # Find the post in the mongo
    results = mongo.db.pages.find_one({"_id":id})

    if(results == None):
        p = page.Page()
        message = "App: %s not found. URL is not correct." % (appName)
        return p.renderError(message)

    # Make sure the applications directory is in the python
    # path
    dirname, filename = os.path.split(os.path.abspath(__file__))
    appsPath = os.path.join(dirname, "../../apps")
    #print appsPath

    # Check if allready in sys.path
    if(appsPath not in sys.path):
        # Add to the system path
        sys.path.append(appsPath)

    # Get the application path
    if('path' in results):
        appPath = results['path']
    else:
        p = page.Page()
        message = "App path not found in config"
        return p.renderError(message)

    # Check if the app exists
    filePath = os.path.join(appPath,appName + ".py")
    if(not os.path.isfile(filePath)):
        p = page.Page()
        message = "App file: %s not found." % (filePath)
        return p.renderError(message)

    # Import the module
    app = __import__(appName + "." + appName, fromlist=[''])

    # Create the page
    p = page.Page()

    # Setup (and verify) the page
    goodConfig = p.loadConfig(results)

    # The page is no good
    if(not goodConfig):
        p = page.Page()
        message = "Error in app config"
        return p.renderError(message)

    # Render the application
    p.content = app.render(request.args,mongo)

    # Render the page
    return p.render()

# Serve up some app data
@app.route("/app/<appName>/data/<file>.json")
def appData(appName,file):

    # The id is app_<appName>
    id = "app_" + appName

    # Find the post in the mongo
    results = mongo.db.pages.find_one({"_id":id})

    if(results == None):
        message = "App: %s not found. URL is not correct." % (appName)
        return message

    # Make sure the applications directory is in the python
    # path
    dirname, filename = os.path.split(os.path.abspath(__file__))
    appsPath = os.path.join(dirname, "../../apps")

    # Check if allready in sys.path
    if(appsPath not in sys.path):
        # Add to the system path
        sys.path.append(appsPath)

    # Get the application path
    if('path' in results):
        appPath = results['path']
    else:
        message = "App path not found in config"
        return message

    # Check if the app exists
    filePath = os.path.join(appPath,appName + ".py")
    if(not os.path.isfile(filePath)):
        message = "App file: %s not found." % (filePath)
        return message

    # Import the module
    app = __import__(appName + "." + appName, fromlist=[''])

    # Render the page
    return app.data(mongo, file)

# Serve a file for an app
@app.route("/app/<appName>/<path:path>")
def appFile(appName,path):

    return send_from_directory('../../apps/' + appName, path)

if __name__ == "__main__":
    app.run(debug=True)
