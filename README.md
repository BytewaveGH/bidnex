<<<<<<< HEAD
# BidNex 🎯

A modern, real-time bidding platform built with Next.js and React. BidNex provides a seamless experience for users to participate in auctions, place bids, and track their bidding history.

## ✨ Features

- 🚀 **Real-time Bidding** - Participate in live auctions with instant bid updates
- 📱 **Responsive Design** - Beautiful UI that works seamlessly on desktop and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 🔐 **User Authentication** - Secure user accounts and bidding history
- ⏰ **Auction Management** - Create, manage, and track auctions
- 📊 **Bid Tracking** - Monitor your bids and auction status in real-time
- 🌙 **Dark Mode** - Eye-friendly dark theme support
- ⚡ **Performance Optimized** - Built with Next.js for optimal performance

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with React 19
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript
- **Package Manager**: npm

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (version 18 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## 🚀 Getting Started

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bidnex.git
cd bidnex
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

### Building for Production

To create an optimized production build:

```bash
npm run build
npm start
```

## 📁 Project Structure

```
bidnex/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # React components (to be added)
├── lib/                   # Utility functions
│   └── utils.ts          # Helper utilities
├── public/                # Static assets
├── components.json        # shadcn/ui configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🎯 Usage

### For Users

1. **Browse Auctions** - View all available auctions on the homepage
2. **Place Bids** - Click on an auction to view details and place your bid
3. **Track Activity** - Monitor your bidding history and auction status
4. **Win Auctions** - Receive notifications when you win an auction

### For Developers

- Run `npm run dev` to start the development server
- Run `npm run lint` to check for linting errors
- Run `npm run build` to create a production build

## 🔧 Configuration

The project uses several configuration files:

- `components.json` - shadcn/ui component configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing framework
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## 📞 Support

If you have any questions or need help, please:

- Open an issue on GitHub
- Check the [Documentation](https://nextjs.org/docs)
- Visit our [Support Center](https://vercel.com/support)

---

Made with ❤️ by the BidNex team

=======
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
>>>>>>> 7ce7bde (Local frontend updates before branch switch)
