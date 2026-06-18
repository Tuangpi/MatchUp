import path from 'path';

const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',
    rootDir: path.resolve(__dirname, '..'),

    // JWT
    jwtSecret: process.env.JWT_SECRET || 'matchup-dev-secret-change-in-production',
    jwtExpiresIn: '15m',
    refreshTokenExpiresIn: '7d',
    refreshTokenBytes: 64,
};

export default config;
