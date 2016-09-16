import os
import json
import markdown
from pymongo import MongoClient

def main():

    # Connect to mongoDB
    client = MongoClient()
    db = client.dalab

    # Load the posts
    postDir = os.path.join(os.getcwd(), "../posts")
    pages = []

    for d in os.listdir(postDir):

        # Get the json path
        configPath = os.path.join(postDir, d + "/" + d + ".json")
        config = None

        # Check if the json exists
        if(os.path.isfile(configPath)):

            config = parseJson(configPath)

            # Give it the name
            config['name'] = d

            # If there is not a type, assign one
            if('type' not in config):
                config['type'] = 'post'

        if(verifyConfig(config,postDir)):
            # Parse the content
            fileFormat = config['format']
            if(fileFormat == "md"):
                contentPath = postDir + "/" + \
                                d + "/" + \
                                d + ".md"

                config['content'] = parseMD(contentPath)

            if(fileFormat == "html"):
                contentPath = postDir + "/" + \
                                d + "/" + \
                                d + ".html"

                config['content'] = parseHTML(contentPath)

            id = config['type'] + "_" + d
            config["_id"] = id

            # Set up some things if not there
            if('description' not in config):
                config['description'] = ""

            if('tags' not in config):
                config['tags'] = []

            config['url'] = "/post/" + d

            db.pages.save(config)

            # For cleaning up, remember the pages
            pages.append(id)

    # Load the apps
    appDir = os.path.join(os.getcwd(), "../apps")

    for d in os.listdir(appDir):

        # Make sure the files are in the folders
        configPath = os.path.join(appDir, d + "/" + d + ".json")

        config = None
        print configPath
        # Check if the json exists
        if(os.path.isfile(configPath)):

            config = parseJson(configPath)

            # Give it the name
            config['name'] = d

            # Assign the config type
            config['type'] = 'app'
            config['path'] = os.path.join(appDir, d)

            # Verify the config
            if(verifyConfig(config,appDir)):

                id = config['type'] + "_" + d

                # Set up some things if not there
                if('description' not in config):
                    config['description'] = ""

                if('tags' not in config):
                    config['tags'] = []

                config['url'] = "/app/" + d

                config["_id"] = id
                db.pages.save(config)

                # For cleaning up, remember the pages
                pages.append(id)


    # Delete anything not found in the files
    allEntries = db.pages.find()
    for entry in allEntries:
        if entry['_id'] not in pages:
            db.pages.remove({ "_id" : entry['_id'] })

def parseJson(jsonFile):

    with open(jsonFile) as jf:
        data = json.load(jf)

    return data

def parseMD(mdFile):

    with open(mdFile) as md:

        html = markdown.markdown(md.read())
        return html

    return ""


def parseHTML(htmlFile):

    with open(htmlFile) as html:

        return html.read()

    return ""

def verifyConfig(config,postDir):


    if(config == None):
        return False

    if('title' not in config):
        return False

    if('format' not in config and \
        (config['format'] == 'md' or config['format'] == 'html' or \
         config['format'] == 'py')):
        return False

    if('type' not in config):
        return False

    if('name' not in config):
        return False

    # Make sure the content is there
    contentPath = postDir + "/" + \
                    config['name'] + "/" + \
                    config['name'] + "." + config['format']

    if(not os.path.isfile(contentPath)):
        return False

    return True

    return data
if __name__ == "__main__":
    main()
