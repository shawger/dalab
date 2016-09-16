
'''
Page is an object used for displaying a standard page
'''
import os
import jinja2

import os
import sys
import nav
import json

# Setup the JINJA envronment
templatePath = os.path.abspath(os.path.join(os.path.dirname(__file__),
                                            '..',
                                            '..',
                                            'html'))

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(templatePath),
    extensions=['jinja2.ext.autoescape'],
    autoescape=False)

'''
Create a new page
'''
class Page:

    def __init__(self):
        self.title = ""
        self.content = ""
        self.type = ""
        self.nav = nav.Nav()
        self.scripts = ['/javascript/search.js']
        self.data = ""
        self.styles = []
        self.d3 = False

    '''
    Render returns a string that can be sent back to a brower
    in the form of a web page
    '''
    def render(self):

        if(self.nav != None):
            self.nav.title = "DaLab"
            nav = self.nav.render()
        else:
            nav = ""

        template_values = {
            'page': self,
            'nav': nav
        }

        template = JINJA_ENVIRONMENT.get_template('standard.html')

        return template.render(template_values)

    '''
    Render returns an error page with a simple message
    '''
    def renderError(self,message):

        self.content = "<h1> Error </h1> " + message

        return self.render()


    def loadConfig(self,config):

        # Title needs to be in the config.
        if('title' in config):
            self.title = config['title']
            self.nav.title = self.title
        else:
            return False

        # Type needs to be in the config
        if('type' in config):
            self.type = config['type']
        else:
            return False

        if('scripts' in config):
            self.scripts = self.scripts + config['scripts']

        if('styles' in config):
            self.styles = config['styles']

        if('description' in config):
            self.description = config['description']

        if('tags' in config):
            self.tags = config['tags']

        return True
