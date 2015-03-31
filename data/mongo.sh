#--------------------------------------------------------------------------------------
#  start mongodb
#----------------------------------------------------------------------------------------
mongod --dbpath <db_path>
mongod --dbpath "G:\Dong\My Documents\Private\Project\Technology\visPlayer\data\db"
mongod --dbpath "C:\Users\dzhao\My Projects\General\visPlayer\data\db"
mongod --dbpath <log_path>
mongod --dbpath "G:\Dong\My Documents\Private\Project\Technology\visPlayer\data\log\mongod.log"
mongod --logpath "C:\Users\dzhao\My Projects\General\visPlayer\data\log\mongod.log"
mongo

----------------------------------------------------------------------------------------
//  import commands
----------------------------------------------------------------------------------------
mongoimport --db visfuture-dev --collection tools --type json --file "G:\Dong\My Documents\Private\Project\Technology\visPlayer\data\tools.json" --jsonArray
mongoimport --db visfuture-dev --collection tools --type json --file "C:\Users\dzhao\My Projects\General\visPlayer\data\tools.json" --jsonArray