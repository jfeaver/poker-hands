using System.Text.Json.Serialization;
using DeckOfCardsLibrary;
using PokerLibrary;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevCors", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173") // React dev server
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.All;
});
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(
        new JsonStringEnumConverter()
    );
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseCors("DevCors");
    app.UseHttpLogging();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.MapPost("/hand_comparisons", (PlayerHand[] players) =>
{
    if (players is null || players.Length == 0)
    {
        return Results.BadRequest("At least one player is required.");
    }

    // Reduce players into a winner:
    var winningPlayer = players[0];
    var winningHand = PokerHand.getBestHand(winningPlayer.Hand);

    for (int i = 1; i < players.Length; i++)
    {
        var currentHand = PokerHand.getBestHand(players[i].Hand);

        if (currentHand.winsAgainst(winningHand) ?? false)
        {
            winningHand = currentHand;
            winningPlayer = players[i];
        }
    }

    return Results.Ok(
        new PotWinner
            (
                winningPlayer.PlayerId,
                winningHand.handRank,
                winningPlayer.Hand
            )
    );
})
.WithName("CreateHandComparison");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

record PotWinner(string PlayerId, PokerHand.HandRank Title, Card[] Hand) { }

record PlayerHand(
    string PlayerId,
    Card[] Hand
);
