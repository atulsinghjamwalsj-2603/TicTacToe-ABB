using Xunit;
using TicTacToe.Api.Services;
using TicTacToe.Api.Models;

namespace TicTacToe.Tests
{
    public class GameServiceTests
    {
        private readonly GameService _service;
        public GameServiceTests()
        {
            _service = new GameService();
            _service.ResetScoreboard();
        }

        [Fact]
        public void CreateGame_ShouldInitializeCorrectly()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            Assert.NotNull(game);
            Assert.Equal(9, game.Board.Length);
            Assert.Equal("X", game.CurrentPlayer);
            Assert.Equal(GameStatus.InProgress, game.Status);
        }

        [Fact]
        public void MakeMove_ValidMove_ShouldUpdateBoard()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);

            Assert.Equal("X", game.Board[0]);
        }

        [Fact]
        public void MakeMove_CellAlreadyFilled_ShouldNotChangeBoard()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 0);

            Assert.Equal("X", game.Board[0]);
        }

        [Fact]
        public void MakeMove_WrongTurn_ShouldBeIgnored()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "O", 0);

            Assert.Null(game.Board[0]);
        }

        [Fact]
        public void MakeMove_InvalidIndex_ShouldBeIgnored()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 9); // invalid

            Assert.All(game.Board, cell => Assert.Null(cell));
        }
        [Fact]
        public void MakeMove_ShouldSwitchPlayer()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);

            Assert.Equal("O", game.CurrentPlayer);
        }

        [Fact]
        public void ShouldDetect_RowWin()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 3);
            _service.MakeMove(game.Id, "X", 1);
            _service.MakeMove(game.Id, "O", 4);
            _service.MakeMove(game.Id, "X", 2);

            Assert.Equal(GameStatus.Won, game.Status);
            Assert.Equal("X", game.Winner);
        }

        [Fact]
        public void ShouldDetect_ColumnWin()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 1);
            _service.MakeMove(game.Id, "X", 3);
            _service.MakeMove(game.Id, "O", 2);
            _service.MakeMove(game.Id, "X", 6);

            Assert.Equal(GameStatus.Won, game.Status);
            Assert.Equal("X", game.Winner);
        }

        [Fact]
        public void ShouldDetect_DiagonalWin()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 1);
            _service.MakeMove(game.Id, "X", 4);
            _service.MakeMove(game.Id, "O", 2);
            _service.MakeMove(game.Id, "X", 8);

            Assert.Equal(GameStatus.Won, game.Status);
            Assert.Equal("X", game.Winner);
        }

        [Fact]
        public void ShouldDetect_Draw()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            int[] moves = { 0, 1, 2, 4, 3, 5, 7, 6, 8 };
            string player = "X";

            foreach (var move in moves)
            {
                _service.MakeMove(game.Id, player, move);
                player = player == "X" ? "O" : "X";
            }

            Assert.Equal(GameStatus.Draw, game.Status);
        }

        [Fact]
        public void ResetGame_ShouldClearBoard()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.ResetGame(game.Id);

            Assert.All(game.Board, cell => Assert.Null(cell));
            Assert.Equal(GameStatus.InProgress, game.Status);
        }

        [Fact]
        public void ResetGame_ShouldResetCurrentPlayer()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.ResetGame(game.Id);

            Assert.Equal("X", game.CurrentPlayer);
        }

        [Fact]
        public void Undo_TwoPlayer_ShouldRemoveLastMove()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 1);

            _service.Undo(game.Id);

            Assert.Null(game.Board[1]);
            Assert.Equal("O", game.CurrentPlayer);
        }

        [Fact]
        public void Undo_ComputerMode_ShouldRemoveTwoMoves()
        {
            var game = _service.CreateGame(GameMode.VsComputer);

            _service.MakeMove(game.Id, "X", 0); // Player move + computer move

            _service.Undo(game.Id);

            int filledCells = game.Board.Count(c => c != null);

            Assert.Equal(0, filledCells);
        }

        [Fact]
        public void Undo_WithNoMoves_ShouldDoNothing()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.Undo(game.Id);

            Assert.All(game.Board, cell => Assert.Null(cell));
        }

        [Fact]
        public void ComputerMove_ShouldAutoPlay()
        {
            var game = _service.CreateGame(GameMode.VsComputer);

            _service.MakeMove(game.Id, "X", 0);

            int filledCells = game.Board.Count(c => c != null);

            Assert.True(filledCells >= 2); // player + computer
        }

        [Fact]
        public void Move_AfterGameFinished_ShouldBeIgnored()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 3);
            _service.MakeMove(game.Id, "X", 1);
            _service.MakeMove(game.Id, "O", 4);
            _service.MakeMove(game.Id, "X", 2); // win

            _service.MakeMove(game.Id, "O", 5);

            Assert.Null(game.Board[5]);
        }

        [Fact]
        public void Scoreboard_ShouldUpdate_OnWin()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 3);
            _service.MakeMove(game.Id, "X", 1);
            _service.MakeMove(game.Id, "O", 4);
            _service.MakeMove(game.Id, "X", 2); // X wins

            var scoreboard = _service.GetScoreboard();

            Assert.Equal(1, scoreboard.XWins);
            Assert.Equal(0, scoreboard.OWins);
            Assert.Equal(0, scoreboard.Draws);
        }

        [Fact]
        public void Scoreboard_ShouldUpdate_OnDraw()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            int[] moves = { 0, 1, 2, 4, 3, 5, 7, 6, 8 };
            string player = "X";

            foreach (var move in moves)
            {
                _service.MakeMove(game.Id, player, move);
                player = player == "X" ? "O" : "X";
            }

            var scoreboard = _service.GetScoreboard();

            Assert.Equal(0, scoreboard.XWins);
            Assert.Equal(0, scoreboard.OWins);
            Assert.Equal(1, scoreboard.Draws);
        }

        [Fact]
        public void Scoreboard_Should_Reset_Correctly()
        {
            var game = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game.Id, "X", 0);
            _service.MakeMove(game.Id, "O", 3);
            _service.MakeMove(game.Id, "X", 1);
            _service.MakeMove(game.Id, "O", 4);
            _service.MakeMove(game.Id, "X", 2); // X wins

            _service.ResetScoreboard();

            var scoreboard = _service.GetScoreboard();

            Assert.Equal(0, scoreboard.XWins);
            Assert.Equal(0, scoreboard.OWins);
            Assert.Equal(0, scoreboard.Draws);
        }

        [Fact]
        public void Scoreboard_ShouldAccumulateAcrossGames()
        {
            var game1 = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game1.Id, "X", 0);
            _service.MakeMove(game1.Id, "O", 3);
            _service.MakeMove(game1.Id, "X", 1);
            _service.MakeMove(game1.Id, "O", 4);
            _service.MakeMove(game1.Id, "X", 2); // X wins

            var game2 = _service.CreateGame(GameMode.TwoPlayer);

            _service.MakeMove(game2.Id, "X", 0);
            _service.MakeMove(game2.Id, "O", 1);
            _service.MakeMove(game2.Id, "X", 3);
            _service.MakeMove(game2.Id, "O", 2);
            _service.MakeMove(game2.Id, "X", 6); // X wins again

            var scoreboard = _service.GetScoreboard();

            Assert.Equal(2, scoreboard.XWins);
        }

        [Fact]
        public void ComputerMove_ShouldNotOverwriteExistingCell()
        {
            var game = _service.CreateGame(GameMode.VsComputer);

            _service.MakeMove(game.Id, "X", 0);

            Assert.Equal("X", game.Board[0]); // ensure still intact
        }
    }

}
