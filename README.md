# Score Mate

A web application to track and manage team scores across multiple phases of a game. Built with React, TypeScript, and Vite.

---

## Features

- Add teams and record their scores for each phase.
- Edit the score delta (points won) for any team in any phase.
- Automatic recalculation of cumulative totals after editing.
- Responsive and user-friendly interface.
- History table showing phase-by-phase deltas and totals.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-username/score-mate.git
   cd score-mate
   ```

2. **Install dependencies:**

   Using npm:
   ```bash
   npm install
   ```

   Or using yarn:
   ```bash
   yarn install
   ```

3. **Start the development server:**

   Using npm:
   ```bash
   npm run dev
   ```

   Or using yarn:
   ```bash
   yarn dev
   ```

4. **Open your browser and visit:**

   ```
   http://localhost:5173
   ```

---

## Usage

- **Add Teams:** Use the interface to add teams before starting a game.
- **Record Scores:** For each phase, input the points each team has won.
- **Edit Scores:** Click on any cell in the history table to edit the points won in that phase. The application will automatically recalculate totals.
- **View Totals:** The last row of the table always shows the current total for each team.

---

## Project Structure
src/
components/ # Reusable UI components
modules/
history/
components/ # History table and related components
utils/ # Utility functions for score calculations
lib/ # Type definitions and shared logic
App.tsx # Main application component
main.tsx # Entry point

---

## Customization

- You can adjust the number of teams, phases, and scoring logic by modifying the relevant components and utility functions in `src/modules/history/`.
- Styling is handled with Tailwind CSS (or your chosen framework).

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Contact

For questions or support, open an issue or contact [your-email@example.com](mailto:your-email@example.com).