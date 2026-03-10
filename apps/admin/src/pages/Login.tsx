import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { LoginForm } from '../components/auth/LoginForm';

export const Login = () => {
  return (
    <Grid container sx={{ height: '100vh' }}>
      {/* Left Side - White Background with Logo */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        
        
        {/* Logo */}
        <Box sx={{ zIndex: 1, textAlign: 'center', p: 4 }}>
          <img
            src="/locomotiva_hub_logo_2-removebg-preview.png"
            alt="Locomotiva Hub Logo"
            style={{ maxWidth: '100%', maxHeight: 300, objectFit: 'contain' }}
          />
        </Box>
      </Grid>

      {/* Right Side - Navy Blue Background with Login Form */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          backgroundColor: 'primary.main',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          p: 4,
        }}
      >
        <LoginForm />
      </Grid>
    </Grid>
  );
};
