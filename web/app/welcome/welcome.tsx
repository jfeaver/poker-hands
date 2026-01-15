import { useState, type ChangeEvent } from "react";

enum Suit {
  Clubs = "Clubs",
  Diamonds = "Diamonds",
  Hearts = "Hearts",
  Spades = "Spades",
}

enum Rank {
  Two = "Two",
  Three = "Three",
  Four = "Four",
  Five = "Five",
  Six = "Six",
  Seven = "Seven",
  Eight = "Eight",
  Nine = "Nine",
  Ten = "Ten",
  Jack = "Jack",
  Queen = "Queen",
  King = "King",
  Ace = "Ace",
}

enum HandTitle {
  HighCard = "HighCard",
  Pair = "Pair",
  TwoPair = "TwoPair",
  Trips = "Trips",
  Straight = "Straight",
  Flush = "Flush",
  FullHouse = "FullHouse",
  Quads = "Quads",
  StraightFlush = "StraightFlush",
}

interface Card {
  rank: Rank;
  suit: Suit;
}

interface PokerHand {
  playerId: string;
  hand: Array<Card>;
  title?: HandTitle;
}

function handTitle(hand: PokerHand) {
  switch (hand.title) {
    case HandTitle.HighCard:
      return "a high card";
    case HandTitle.Pair:
      return "one pair";
    case HandTitle.TwoPair:
      return "two pairs";
    case HandTitle.Trips:
      return "three of a kind";
    case HandTitle.Straight:
      return "a straight";
    case HandTitle.Flush:
      return "a flush";
    case HandTitle.FullHouse:
      return "a full house";
    case HandTitle.Quads:
      return "four of a kind";
    case HandTitle.StraightFlush:
      return "a straight flush";
  }
}

const suitSymbol: Record<Suit, string> = {
  [Suit.Clubs]: "♣️",
  [Suit.Diamonds]: "♦️",
  [Suit.Hearts]: "❤️",
  [Suit.Spades]: "♠️",
};

const rankShort: Record<Rank, string> = {
  [Rank.Two]: "2",
  [Rank.Three]: "3",
  [Rank.Four]: "4",
  [Rank.Five]: "5",
  [Rank.Six]: "6",
  [Rank.Seven]: "7",
  [Rank.Eight]: "8",
  [Rank.Nine]: "9",
  [Rank.Ten]: "T",
  [Rank.Jack]: "J",
  [Rank.Queen]: "Q",
  [Rank.King]: "K",
  [Rank.Ace]: "A",
};

function cardImage(card: Card) {
  return `/cards/Playing_card_${card.suit.toLowerCase()}_${rankShort[card.rank]}.svg`;
}

const allCards: Card[] = Object.values(Rank).flatMap((rank) =>
  Object.values(Suit).map((suit) => ({ rank, suit }))
);

function CardPicker({
  card,
  onChange,
}: {
  card: Card;
  onChange: (card: Card) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div
        className="w-20 h-25 rounded border shadow cursor-pointer bg-cover bg-center"
        style={{ backgroundImage: `url(${cardImage(card)})` }}
        onClick={() => setOpen(!open)}
      />

      {open && (
        <div className="absolute z-10 mt-2 max-h-64 overflow-y-scroll bg-white border rounded shadow">
          {allCards.map((card) => (
            <div
              key={`${card.rank}-${card.suit}`}
              className="px-3 py-1 cursor-pointer hover:bg-slate-100 whitespace-nowrap"
              onClick={() => {
                onChange(card);
                setOpen(false);
              }}
            >
              {rankShort[card.rank]}
              {suitSymbol[card.suit]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PlayerHandEditor({
  hand,
  winningHand,
  onUpdate,
}: {
  hand: PokerHand;
  winningHand?: PokerHand;
  onUpdate: (updated: PokerHand) => void;
}) {
  const updateCard = (index: number, card: Card) => {
    const nextHand = [...hand.hand];
    nextHand[index] = card;
    onUpdate({ ...hand, hand: nextHand });
  };

  const updatePlayerId = (event: ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...hand, playerId: event.target.value });
  };

  const isWinner = hand.playerId == winningHand?.playerId;

  return (
    <div
      className={
        "flex flex-col items-center gap-2 p-4" +
        (isWinner ? " bg-amber-200" : "")
      }
    >
      <h4 className="font-semibold">
        <input
          className="text-center"
          type="text"
          value={hand.playerId}
          onChange={updatePlayerId}
        ></input>
      </h4>
      <div className="flex gap-2">
        {hand.hand.map((card, cardIndex) => (
          <CardPicker
            key={cardIndex}
            card={card}
            onChange={(updatedCard) => updateCard(cardIndex, updatedCard)}
          />
        ))}
      </div>
    </div>
  );
}

function WinningHand({ hand }: { hand: PokerHand }) {
  console.log({ hand });
  return (
    <div>
      <h3>{hand.playerId} Wins!</h3>
      <p>
        {hand.playerId} wins with {handTitle(hand)}.
      </p>
    </div>
  );
}

const initialPokerHands = [
  {
    playerId: "Ted",
    hand: [
      { rank: Rank.Two, suit: Suit.Hearts },
      { rank: Rank.Three, suit: Suit.Diamonds },
      { rank: Rank.Five, suit: Suit.Spades },
      { rank: Rank.Nine, suit: Suit.Clubs },
      { rank: Rank.King, suit: Suit.Diamonds },
    ],
  },
  {
    playerId: "Louis",
    hand: [
      { rank: Rank.Two, suit: Suit.Clubs },
      { rank: Rank.Three, suit: Suit.Hearts },
      { rank: Rank.Four, suit: Suit.Spades },
      { rank: Rank.Eight, suit: Suit.Clubs },
      { rank: Rank.Ace, suit: Suit.Hearts },
    ],
  },
];

export function Welcome() {
  const [pokerHands, setPokerHands_] =
    useState<Array<PokerHand>>(initialPokerHands);
  const [winningHand, setWinningHand] = useState<PokerHand>();

  const setPokerHands: React.Dispatch<
    React.SetStateAction<Array<PokerHand>>
  > = (nextPokerHands) => {
    setPokerHands_(nextPokerHands);
    setWinningHand(undefined);
  };

  const handlePost = async () => {
    try {
      const response = await fetch("http://localhost:5214/hand_comparisons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pokerHands),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setWinningHand(data);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error("Unknown Error", error);
      }
    }
  };

  const tedVsLouis = () => {
    setPokerHands(initialPokerHands);
  };

  const blackVsWhite = () => {
    setPokerHands([
      {
        playerId: "Black",
        hand: [
          { rank: Rank.Two, suit: Suit.Hearts },
          { rank: Rank.Three, suit: Suit.Hearts },
          { rank: Rank.Four, suit: Suit.Hearts },
          { rank: Rank.Five, suit: Suit.Hearts },
          { rank: Rank.Six, suit: Suit.Hearts },
        ],
      },
      {
        playerId: "White",
        hand: [
          { rank: Rank.Two, suit: Suit.Clubs },
          { rank: Rank.Two, suit: Suit.Hearts },
          { rank: Rank.Three, suit: Suit.Hearts },
          { rank: Rank.Three, suit: Suit.Clubs },
          { rank: Rank.King, suit: Suit.Hearts },
        ],
      },
    ]);
  };

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        {/* Preset row */}
        <div className="flex gap-4 justify-center">
          <button
            className="
              inline-flex items-center justify-center
              rounded-md bg-slate-900
              px-4 py-2
              text-sm font-medium text-white
              shadow
              cursor-pointer hover:bg-slate-800
              active:bg-slate-700
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={tedVsLouis}
          >
            Ted vs Louis
          </button>
          <button
            className="
              inline-flex items-center justify-center
              rounded-md bg-slate-900
              px-4 py-2
              text-sm font-medium text-white
              shadow
              cursor-pointer hover:bg-slate-800
              active:bg-slate-700
              disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={blackVsWhite}
          >
            Black vs White
          </button>
        </div>

        {/* Hands editor row */}
        {pokerHands.length > 0 && (
          <div className="flex gap-12 justify-center">
            {pokerHands.map((hand, handIndex) => (
              <PlayerHandEditor
                key={handIndex}
                hand={hand}
                winningHand={winningHand}
                onUpdate={(updated) => {
                  const next = [...pokerHands];
                  next[handIndex] = updated;
                  setPokerHands(next);
                }}
              />
            ))}
          </div>
        )}

        {/* Action row */}
        <button
          className="
            inline-flex items-center justify-center
            rounded-md bg-slate-900
            px-4 py-2
            text-sm font-medium text-white
            shadow
            cursor-pointer hover:bg-slate-800
            active:bg-slate-700
            disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={pokerHands.length ? undefined : true}
          onClick={handlePost}
        >
          Who gets the pot?
        </button>
        {winningHand ? <WinningHand hand={winningHand} /> : <></>}
      </div>
    </main>
  );
}
