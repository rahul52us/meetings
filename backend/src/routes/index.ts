import express from 'express';
import axios from 'axios';
import ZohoToken from '~/repository/schemas/zohoTOken.schema';

const handleZohoCallback = async (req: any, res: express.Response) => {
  let authorizationCode = req.query.code as string;

  console.log(authorizationCode);
  if (!authorizationCode) {
    res.status(400).send('Authorization code is missing');
    return;
  }

  try {
    const response = await axios.post(
      'https://accounts.zoho.in/oauth/v2/token',
      new URLSearchParams({
        code: authorizationCode,
        client_id: '1000.VDXANK1UK0N6H0AX6W3HDZIBI4FHUE',
        client_secret: '4a56e307599c8bfd47dedd744e5af946e7ef6d437b',
        redirect_uri: 'http://localhost:5029/zoho/callback',
        grant_type: 'authorization_code',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log(response?.data)
    const { access_token, refresh_token, expires_in, scope, token_type } = response.data;

    const zohoToken = new ZohoToken({
      access_token,
      refresh_token,
      expires_in,
      scope,
      token_type,
    });

    // Save the tokens to the database
    await zohoToken.save();

    // Store tokens in session (if necessary)
    req.session.access_token = access_token;
    req.session.refresh_token = refresh_token;

    console.log(response?.data);
    res.send({
      message: 'Zoho OAuth authentication successful!',
      access_token,
      refresh_token,
      expires_in,
    });
  } catch (error) {
    console.error('Error fetching tokens from Zoho:', error?.message);
    res.status(500).send('Error fetching tokens from Zoho');
  }
};

const routes = express.Router();

// Home route
routes.get('/', (req, res) => {
  res.send('Welcome to the app');
});

// Zoho OAuth callback route
routes.get('/zoho/callback', handleZohoCallback);

export default routes;
