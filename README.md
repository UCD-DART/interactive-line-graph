Just a repo to keep progress of getting the line graph to work right. Different files acting as different branches to be able to incorporate other blocks

This is a little bit of a mess, some of the files didn't push when I was trying and ran out of time friday afternoon. The dist folder is supposed to have an invasive.js and a zika.js and a index.html + zika.html + styles.css but they weren't appearing after I pushed... But to make sure everything can be recreated:

From invasive branch:

clone the repo
Run npm install after you clone

All logic is inside src/js/invasive.his module uses the map module pretty heavily
npm start will start a dev server that will serve out of localhost:8080
npm run build will build a production build out of dist/ with a styles.css + index.html + invasive.js

When editing, always edit within the src/ directory. Edit the SCSS files for styling (can use same CSS rules as always, SCSS just gives you more flexibility).

**_NVM when i finished this readme, all appropriate files were in the dist folder. but still edit the SRC directory to make changes_**
