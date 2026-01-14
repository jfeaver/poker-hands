using System.Text.Json.Serialization;

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
    // return Results.Json(
    //     new PotWinner
    //         (
    //             "Louis",
    //             HandTitle.HighCard,
    //             [new Card(Rank.Two, Suit.Clubs), new Card(Rank.Three, Suit.Hearts), new Card(Rank.Four, Suit.Spades), new Card(Rank.Eight, Suit.Clubs), new Card(Rank.Ace, Suit.Hearts)],
    //             [new Card(Rank.Ace, Suit.Hearts)]
    //         ),
    //     new System.Text.Json.JsonSerializerOptions
    //     {
    //         Converters = { new JsonStringEnumConverter() }
    //     }
    // );
    if (players is null || players.Length == 0)
    {
        return Results.BadRequest("At least one player is required.");
    }

    // Reduce players into a winner:
    var winningPlayer = players[0];
    var winningHand = HandEvaluator.Evaluate(winningPlayer.Hand);

    for (int i = 1; i < players.Length; i++)
    {
        var currentHand = HandEvaluator.Evaluate(players[i].Hand);

        if (currentHand.CompareTo(winningHand) > 0)
        {
            winningHand = currentHand;
            winningPlayer = players[i];
        }
    }

    return Results.Ok(
        new PotWinner
            (
                winningPlayer.PlayerId,
                winningHand.HandRank,
                winningPlayer.Hand,
                winningHand.ScoringCards
            )
    );
})
.WithName("CreateHandComparison");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

public enum HandTitle
{
    HighCard,
    Pair,
    TwoPair,
    Trips,
    Straight,
    Flush,
    FullHouse,
    Quads,
    StraightFlush
}

public enum Rank
{
    Two,
    Three,
    Four,
    Five,
    Six,
    Seven,
    Eight,
    Nine,
    Ten,
    Jack,
    Queen,
    King,
    Ace
}

public enum Suit
{
    Clubs,
    Diamonds,
    Hearts,
    Spades
}

record PotWinner(string PlayerId, HandTitle Title, Card[] Hand, Card[] ScoringCards) { }
record Card(Rank Rank, Suit Suit) { }

record PlayerHand(
    string PlayerId,
    Card[] Hand
);

sealed record EvaluatedHand(
    HandTitle HandRank,
    Card[] ScoringCards
) : IComparable<EvaluatedHand>
{
    public int CompareTo(EvaluatedHand? other)
    {
        if (other is null)
        {
            return 1;
        }

        var categoryComparison = HandRank.CompareTo(other.HandRank);
        if (categoryComparison != 0)
        {
            return categoryComparison;
        }

        // In case two hands are of the same type.
        for (int i = 0; i < ScoringCards.Count(); i++)
        {
            var cmp = ScoringCards[i].Rank.CompareTo(other.ScoringCards[i].Rank);
            if (cmp != 0)
            {
                return cmp;
            }
        }

        return 0;
    }
}

///////////////// HAND EVALUATION /////////////////


sealed record HandAnalysis(
    bool IsFlush,
    bool IsStraight,
    List<List<Card>> Sets
);




static class HandEvaluator
{
    public static EvaluatedHand Evaluate(Card[] cards)
    {
        // sort ranks descending once
        // detect flush / straight / groups
        // return EvaluatedHand(...)
        throw new NotImplementedException();
    }

    static HandAnalysis AnalyzeSortedCards(Card[] sorted)
    {
        bool isFlush = true;
        bool isStraight = true;

        var sets = new List<List<Card>>();
        var currentSet = new List<Card> { sorted[0] };

        for (int i = 1; i < sorted.Length; i++)
        {
            var previous = sorted[i - 1];
            var current = sorted[i];

            // Flush check
            if (current.Suit != sorted[0].Suit)
            {
                isFlush = false;
            }

            // Straight check (basic, Ace-low handled later)
            if (previous.Rank - 1 != current.Rank)
            {
                isStraight = false;
            }

            // Grouping by rank
            if (current.Rank == previous.Rank)
            {
                currentSet.Add(current);
            }
            else
            {
                sets.Add(currentSet);
                currentSet = new List<Card> { current };
            }
        }

        sets.Add(currentSet);

        return new HandAnalysis(
            isFlush,
            isStraight,
            sets
        );
    }
}