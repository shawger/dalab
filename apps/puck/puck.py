import os
import jinja2
import json
import pprint

import dataGetter as dg

# Setup the JINJA envronment
templatePath = os.path.abspath(os.path.join(os.path.dirname(__file__),'html'))

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(templatePath),
    extensions=['jinja2.ext.autoescape'],
    autoescape=False)

def render(args=None, mongo=None):

    team = ""
    season = 0
    game = 0

    if('team' in args):

        team = args['team']

    if('season' in args):

        season = int(args['season'])

    if('game' in args):

        game = int(args['game'])

    # Get all the seasons
    seasons = dg.seasons(mongo)

    # Get all the teams for the last season
    if(season == 0):
        season = seasons[len(seasons)-1]

    teams = dg.teams(mongo,season)

    # Get all the games for that season for the first team
    if(team == ""):
        team = teams[0]

    games = dg.games(mongo,season,team)

    # Set the game
    if(game == 0):
        game = games[len(games)-1]

    template_values = {
        'seasons': seasons,
        'defualtSeason': season,
        'teams': teams,
        'defualtTeam': team,
        'games': games,
        'defualtGame': game
    }

    template = JINJA_ENVIRONMENT.get_template('puck.html')

    return template.render(template_values)

def data(mongo, arg):


	# id is season_team_game
    # Season data should be: seasonData_<season>_<team>_<game>

    if("_" not in arg):
        return {"error": "no data"}

    parts = arg.split('_')

    if(parts[0] == 'seasonData' and len(parts)==4):

        season = int(parts[1])
        team = parts[2]
        game = int(parts[3])

        data = dg.seasonSum(mongo,season,team,game)

        return json.dumps(data, indent=4, sort_keys=True)


    return {"error": "no data"}
