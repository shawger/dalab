
# Get all the seasons in the db
def seasons(mongo):

    return mongo.db.games.distinct('season')

# Get all the teams in a season
def teams(mongo,season):

    return sorted(mongo.db.games.distinct('for.team.abv', {'season': season}))

# Get all the games in a season
def games(mongo,season,team):

    return mongo.db.games.distinct('for.number', {'season': season, 'for.team.abv': team})

def seasonSum(mongo,season,team,game):

    query = {'season': season,
             'for.team.abv': team,
             'for.number': {'$lte': game}}

    project = ['for.number',
               'for.ss.after']

    return list(mongo.db.games.find(query,project))



def gameSum(season,team,game):

    return 'CGY'
