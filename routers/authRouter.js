const authRouter = require('express').Router();
const axios = require('axios').default;

const config = {
    client: {
      id: '9e7da33027952e3a6311',
      secret: 'c323d1bc88ad20a9d48322cec31493185deeb6e8'
    },
    auth: {
        tokenHost: 'https://github.com',
        tokenPath: '/login/oauth/access_token',
        authorizePath: '/login/oauth/authorize',
    }
  };
  
  const { ClientCredentials, ResourceOwnerPassword, AuthorizationCode } = require('simple-oauth2');



const client = new AuthorizationCode(config);

const authorizationUri = client.authorizeURL({
    redirect_uri: 'http://localhost:8000/authentification/callback',
    scope: 'notifications user:email',
    state: '3(#0/!~',
  });

  authRouter.get('/auth', async (req, res) => {
    console.log("redirection to", authorizationUri)
    return res.redirect(authorizationUri);
  });

  authRouter.get('/callback', async (req, res) => {
    const { code } = req.query;
    const options = {
      code,
    };

    try {
      const accessToken = await client.getToken(options);

      const token = accessToken.token.access_token;
      console.log(token)

      // Request user emailsss
      let emails;
      await axios({
        method: 'get',
        url: 'https://api.github.com/user/emails',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Il faut obligatoirement un user agent, un voilà un au pif ¯\_(ツ)_/¯
          'User-Agent': "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36" 
        }
      }).then(function (response) {
        // en cas de réussite de la requête
        emails=response.data;
      })
      .catch(function (error) {
        // en cas d’échec de la requête
        console.log(error);
      })
      console.log(emails);
      
      // Search primary email
      const user_primary_mail = emails.find((e) => e.primary == true).email;
      console.log("PRIMARY", user_primary_mail)

      // Set email as coockie and redirect
      return res.cookie("mail", user_primary_mail).redirect("http://localhost:3000/authentification");
    } catch (error) {
      console.error('Access Token Error', error.message);
      return res.status(500).json('Authentication failed');
    }
  });



  module.exports = authRouter;