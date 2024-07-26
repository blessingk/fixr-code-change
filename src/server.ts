// import app from './app';
//
// const port = process.env.PORT || 3000;
//
// app.listen(port, () => {
//     console.log(`Server is running on port ${port}`);
// });


import app from './app';  // Ensure that `app` resolves correctly
import * as http from 'http';

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
