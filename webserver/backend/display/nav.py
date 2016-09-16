'''
Nav is an object used for creating a navbar
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


class Nav:

    def __init__(self):
        self.title = ""
        self.search = ""

    '''
    Render returns a string that can be sent back to a browser
    in the form of a navbar
    '''
    def render(self):

        template_values = {
            'nav': self,
        }

        template = JINJA_ENVIRONMENT.get_template('nav.html')

        return template.render(template_values)
