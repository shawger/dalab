
'''
Displays the search results
'''
import os
import jinja2

import os
import sys
import nav

#Setup the JINJA envronment
templatePath = os.path.abspath(os.path.join(os.path.dirname( __file__ ),
    '..',
    '..',
    'html'))

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(templatePath),
    extensions=['jinja2.ext.autoescape'],
    autoescape=False)


class Search:

    def __init__(self):
        self.title = ""

    '''
    Renders the search results
    '''

    def render(self, mongo, searchQuery, searchArgs, title=""):

        # See if the search results are blank:
        if (searchQuery == ""):
            searchTerm = {}
            if (title == ""):
                title = "All Apps and Posts"

        else:

            #Specific search
            if(searchArgs.get('name') != None):
                searchTerm = {"name": searchArgs.get('name')}

            #Tag search
            elif(searchArgs.get('tags') != None):
                searchTerm = {"tags": searchArgs.get('tags')}

            #Type search
            elif(searchArgs.get('type') != None):
                searchTerm = {"type": searchArgs.get('type')}

            #Do a text search
            else:
                searchTerm = {"$or": [{"name": {'$regex': searchQuery}},
                                       {"description": {'$regex': searchQuery}},
                                       {"title": {'$regex': searchQuery}},
                                       {"tags": {'$regex': searchQuery}}]}

        results = mongo.db.pages.find(searchTerm,{'name':1,
                                                  'title':1,
                                                  'url': 1,
                                                  'type': 1,
                                                  'description': 1,
                                                  'tags': 1})

        template_values = {
            'results': results,
            'title': title
        }

        template = JINJA_ENVIRONMENT.get_template('search.html')


        return template.render(template_values)
