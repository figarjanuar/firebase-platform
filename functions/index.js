const functions = require('firebase-functions');
const firebase = require('firebase-admin')
const express = require('express')
const engines = require('consolidate')

const app = express()
const firebaseApp = firebase.initializeApp(functions.config().firebase)
const db = firebaseApp.database()

// set the view engine to ejs
app.engine('hbs', engines.handlebars)
app.set('views', './views')
app.set('view engine', 'hbs');

app.get('/', (req, res) => {
    // res.set('Cache-Control', 'public, max-age=300, x-maxage=600')
    const refProfile = db.ref('profile')
    const refAbout = db.ref('about')
    const refSkill = db.ref('skill').once('value')
    const refExpertise = db.ref('expertise').once('value')
    const refWork = db.ref('work').once('value')
    const refEducation = db.ref('education').once('value')
    const refContact = db.ref('contact').once('value')
    var zz = refProfile.once('value')
    var qq = refAbout.once('value')
    Promise.all([zz, qq, refSkill, refExpertise, refWork, refEducation, refContact]).then(ress => {
        let dataProfile = []
        ress[0].forEach( data => {
            dataProfile.push({
                nama: data.val().nama,
                profesi: data.val().profesi,
                social_media: {
                    facebook: data.val().social_media.facebook,
                    linkedin: data.val().social_media.linkedin,
                    github: data.val().social_media.github,
                    instagram: data.val().social_media.instagram
                }
            })
        })
        let dataAbout = []
        ress[1].forEach(data =>{
            dataAbout.push({
                story: data.val().story
            })
        })
        let dataSkill = []
        ress[2].forEach(data =>{
            dataSkill.push({
                title: data.val().title,
                score : data.val().score
            })
        })
        dataSkill.sort(function (a, b) {
            return b.score - a.score;
        })
        let dataExpertise = []
        ress[3].forEach(data =>{
            dataExpertise.push({
                title: data.val().title,
                desc : data.val().desc
            })
        })
        let dataWork = []
        ress[4].forEach(data =>{
            dataWork.push({
                date: data.val().date,
                title: data.val().title,
                office: data.val().office,
                place: data.val().place
            })
        })
        let dataEducation = []
        ress[5].forEach(data =>{
            dataEducation.push({
                date: data.val().date,
                type: data.val().type,
                univ: data.val().univ,
                place: data.val().place
            })
        })
        let dataContact = []
        ress[6].forEach(data =>{
            dataContact.push({
                address: data.val().address,
                email: data.val().email,
                phone: data.val().phone,
            })
        })
        res.render('home', {
            profile: dataProfile[0],
            about: dataAbout[0],
            skill: dataSkill,
            expertise: dataExpertise,
            work: dataWork,
            education: dataEducation,
            contact: dataContact[0]
        })
    })
})

app.get('/backoffice', (req, res) => {
    res.send('THERE IS NO BACKOFFICE!!')
})

app.get('*', function(req, res, next) {
    var err = new Error();
    err.status = 404;
    next(err);
});

// handling 404 errors
app.use(function(err, req, res, next) {
    if(err.status !== 404) {
        return next();
    }

    res.send(err.message || 'Page not found');
});
// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.app = functions.https.onRequest(app);
