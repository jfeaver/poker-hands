# Poker Hands

This is a sample project written for an interview with Winona IT. See the
[accompanying PDF file](Sample%20Code%20Project%20-%20Poker%20Hands.pdf).

The app helps a user determine which poker player has won the pot. A frontend application in /app
is a basic interface written in React (with React Router). The backend is an ASP.NET Core web API
application in the root directory. The API has a single endpoint (POST /hand_comparisons) which
accepts and responds with JSON.

## Get Started

- Install dotnet.
- Restore .NET dependencies and run the backend server with `dotnet run` in the project directory.
- Install node version 20+. I'm using `mise` to manage my Node version in
  [/app/mise.toml](app/mise.toml).
- Install the front end dependencies:

```bash
cd app
npm install
```

- Start the frontend server with `npm run dev` in the `/app` directory.
