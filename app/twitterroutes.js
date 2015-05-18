let isLoggedIn = require('./middlewares/isLoggedIn')
let Twitter = require('twitter')
// let posts = require('../data/posts')
let then = require('express-then')
module.exports = (app) => {
    let passport = app.passport
    let twitterConfig = app.config.auth.twitterAuth
    let networks = {
        twitter: {
              icon: 'twitter',
              name: 'twitter',
              class: 'btn-primary'
        }
    }

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

    // Twitter - Reply
    app.get('/reply/:id', isLoggedIn, then(async (req, res) => {
        try{
                let twitterClient = new Twitter({
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    access_token_key: req.user.twitter.token,
                    access_token_secret: req.user.twitter.tokenSecret
                })
                let id = req.params.id
                let [tweet] = await twitterClient.promise.get('statuses/show/', {id})
                  let post = {
                    id: tweet.id_str,
                    image: tweet.user.profile_image_url,
                    text: tweet.text,
                    name: tweet.user.name,
                    username: '@' + tweet.user.screen_name,
                    liked: tweet.favorited,
                    network: networks.twitter
                  }

                console.log('post: ' + JSON.stringify(post))
                console.log('post image: ' + post.image)
                res.render('reply.ejs', {
                    post: post
                })}catch(e){
                  console.log(e)
                  //e.stack()
                }
    }))
    // Twitter - post reply
    app.post('/reply/:id', isLoggedIn, then(async (req, res) => {
        try{
                let status = req.body.text
                console.log(status)
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
                let id = req.params.id
                await twitterClient.promise.post('statuses/update', {status: status, in_reply_to_status_id: id})
                res.redirect('/timeline')
            } catch (e){
                console.log(e)
            }
    }))

    // Twitter - Share
    app.get('/share/:id', isLoggedIn, then(async (req, res) => {
        try{
                let twitterClient = new Twitter({
                    consumer_key: twitterConfig.consumerKey,
                    consumer_secret: twitterConfig.consumerSecret,
                    access_token_key: req.user.twitter.token,
                    access_token_secret: req.user.twitter.tokenSecret
                })
                let id = req.params.id
                let [tweet] = await twitterClient.promise.get('statuses/show/', {id})
                  let post = {
                    id: tweet.id_str,
                    image: tweet.user.profile_image_url,
                    text: tweet.text,
                    name: tweet.user.name,
                    username: '@' + tweet.user.screen_name,
                    liked: tweet.favorited,
                    network: networks.twitter
                  }

                console.log('post: ' + JSON.stringify(post))
                console.log('post image: ' + post.image)
                res.render('share.ejs', {
                    post: post
                })}catch(e){
                  console.log(e)
                  //e.stack()
                }
    }))

 // Twitter - share
    app.post('/share/:id', isLoggedIn, then(async (req, res) => {
        try{
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

                // if(!status){
                //     return req.flash('error', 'Status cannot be empty!')
                // }
                let id = req.params.id
                console.log('id: ' + id)
                await twitterClient.promise.post('statuses/retweet', {id})
                res.redirect('/timeline')
            } catch (e){
                console.log(e)
            }
    }))

return passport

}
