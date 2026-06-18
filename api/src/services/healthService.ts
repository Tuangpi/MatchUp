const healthService = {
    check: () => ({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }),
};

export default healthService;
