gulp build
cd dist
git add .
git commit -am "deployment"
git push heroku master
cd ../
