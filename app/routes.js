let isLoggedIn = require('./middlewares/isLoggedIn')
let Twitter = require('twitter')
let posts = require('../data/posts')
let then = require('express-then')
module.exports = (app) => {
    let passport = app.passport
    let twitterConfig = app.config.auth.twitterAuth
    let networks = {
        twitter: {
            network: {
              icon: 'facebook',
              name: 'Facebook',
              class: 'btn-primary'
            }
        }
    }

    let scope = 'email'

    app.get('/', (req, res) => res.render('index.ejs'))

    app.get('/profile', isLoggedIn, (req, res) => {
        res.render('profile.ejs', {
            user: req.user,
            message: req.flash('error')
        })
    })

    app.get('/logout', (req, res) => {
        req.logout()
        res.redirect('/')
    })

    app.get('/login', (req, res) => {
        res.render('login.ejs', {message: req.flash('error')})
    })

    app.get('/signup', (req, res) => {
        res.render('signup.ejs', {message: req.flash('error') })
    })

    app.post('/login', passport.authenticate('local-signin', {
		successRedirect: '/profile',
		failureRedirect: '/login',
		failureFlash: true
    }))
  // process the signup form
    app.post('/signup', passport.authenticate('local-signup', {
		successRedirect: '/profile',
		failureRedirect: '/signup',
		failureFlash: true
    }))

    // Facebook - Authentication route and callback URL
	app.get('/auth/facebook', passport.authenticate('facebook', {scope}))

    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))

    // Authorization route and callback
    app.get('/connect/facebook', passport.authorize('facebook', {scope}))
    app.get('/connect/facebook/callback', passport.authorize('facebook', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))

    // Twitter - Authentication route and callback URL
    app.get('/auth/twitter', passport.authenticate('twitter', {scope}))

    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))

    // Authorization route and callback
    app.get('/connect/twitter', passport.authorize('twitter', {scope}))
    app.get('/connect/twitter/callback', passport.authorize('twitter', {
        successRedirect: '/profile',
        failureRedirect: '/profile',
        failureFlash: true
    }))

    // Twitter Timeline
    app.get('/timeline', isLoggedIn, then(async (req, res) => {
        try{
                let twitterClient = new Twitter({
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    access_token_key: req.user.twitter.token,
                    access_token_secret: req.user.twitter.tokenSecret
                })

                console.log('consumerKey: ' + twitterConfig.consumerKey)
                console.log('consumerSecret: ' + twitterConfig.consumerSecret)
                console.log('access_token_key: ' + req.user.twitter.token)
                console.log('access_token_secret: ' + req.user.twitter.tokenSecret)
                let [tweets] = await twitterClient.promise.get('statuses/home_timeline')
                console.log('tweets array: ' + tweets)
                tweets = tweets.map(tweet => {
                  return {
                    id: tweet.id_str,
                    image: tweet.user.profile_image_url,
                    text: tweet.text,
                    name: tweet.user.name,
                    username: '@' + tweet.user.screen_name,
                    liked: tweet.favorited,
                    network: networks.twitter
                  }
                })
                console.log('tweets: ' + JSON.stringify(tweets))
                res.render('timeline.ejs', {
                    posts: tweets
                })}catch(e){
                  console.log(e)
                  //e.stack()
                }
    }))

    // Post Tweets
    app.get('/compose', isLoggedIn, (req, res) => {
        res.render('compose.ejs', {
            message: req.flash('error')
        })
    })

    // Post Tweets
    app.post('/compose', isLoggedIn, then(async (req, res) => {
        let status = req.body.text
        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.tokenSecret
        })
        if(status.length > 140){
            return req.flash('error', 'Status cannot be more than 140 characters!')
        }

        if(!status){
            return req.flash('error', 'Status cannot be empty!')
        }
        await twitterClient.promise.post('statuses/update', {status})
        res.redirect('/timeline')

    }))

    // Like
    app.post('/like/:id', isLoggedIn, then(async (req, res) => {

        let twitterClient = new Twitter({
            consumer_key: twitterConfig.consumerKey,
            consumer_secret: twitterConfig.consumerSecret,
            access_token_key: req.user.twitter.token,
            access_token_secret: req.user.twitter.tokenSecret
        })
        let id = req.params.id
        await twitterClient.promise.post('favorites/create', {id})
        res.end()

    }))

    // Like
    app.post('/unlike/:id', isLoggedIn, then(async (req, res) => {
       try{
           let twitterClient = new Twitter({
               consumer_key: twitterConfig.consumerKey,
               consumer_secret: twitterConfig.consumerSecret,
               access_token_key: req.user.twitter.token,
               access_token_secret: req.user.twitter.tokenSecret
           })
       let id = req.params.id
       await twitterClient.promise.post('favorites/destroy', {id})
       res.end()
        } catch(e){
            console.log(e)
        }
    }))


return passport

}
