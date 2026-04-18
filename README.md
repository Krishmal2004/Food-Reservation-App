# Food Reservation App 🍽️

A comprehensive, full-stack mobile application built with **React Native** and **Node.js**. This platform connects hungry customers with restaurant owners. Customers can effortlessly book tables, order food packages, and reserve function halls for special events, while restaurant owners can manage their offerings and track reservations in real-time.

---

## 🌟 Key Features

### For Users / Customers
* **Authentication**: Secure Login and Registration.
* **Table & Event Reservations**: Browse restaurants, book specific tables, and reserve large function halls.
* **Food Packages**: Pre-order curated food packages.
* **Reviews & Ratings**: Share feedback and rate restaurant experiences.

### For Restaurant Owners
* **Dashboard**: Secure Login and Registration for business owners.
* **Package Management**: Create and manage food menus, table capacities, and function halls.
* **Booking Management**: View and manage incoming table and event reservations.

---

## 🛠️ Tech Stack
* **Frontend**: React Native (TypeScript), `@react-navigation`, Axios
* **Backend**: Node.js, Express.js, JWT Auth, bcrypt
* **Database**: MongoDB, Mongoose

---

## 📂 Project Structure

```text
Food-Reservation-App/
├── frontend/                  # React Native Mobile Application
│   ├── src/
│   │   ├── screens/           # Auth, Booking, Dashboard, Review screens
│   │   ├── components/        # Reusable UI components
│   │   └── navigation/        # React Navigation setup
│   ├── App.tsx                # App entry point
│   ├── package.json
│   └── tsconfig.json
│
├── backend/                   # Node.js & Express API
│   ├── src/
│   │   ├── routes/            # /api/auth, /api/resturant, /api/user
│   │   ├── controllers/       # Route logic and handlers
│   │   ├── models/            # Mongoose schemas (Users, Bookings, etc.)
│   │   └── middleware/        # JWT auth, CORS, error handling
│   ├── server.js              # Express server entry point
│   └── package.json
│
├── system-architecture.drawio # Draw.io Diagram: Client/Server flow
├── database-schema.drawio     # Draw.io Diagram: MongoDB entity relations
└── README.md                  # Project documentation
```

---

## 🚀 Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

### Prerequisites
* **Node.js** (v16 or higher)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **React Native CLI**: If you don't have it, install it globally:
  ```sh
  npm install -g react-native-cli
  ```
*(Note: This project was originally bootstrapped using `npx react-native init FoodReservationApp`)*

### 1. Clone & Setup Backend
First, clone the repository and get the backend API running.

```sh
git clone https://github.com/Krishmal2004/Food-Reservation-App.git
cd Food-Reservation-App/backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
```
Start the backend server:
```sh
npm run dev
```

### 2. Setup Frontend (Mobile App)
Open a new terminal window and navigate to the frontend directory:

```sh
cd ../frontend
npm install
```

---

## 📱 Running the App

### Step 1: Start Metro
First, you will need to run **Metro**, the JavaScript build tool for React Native.
To start the Metro dev server, run the following command from the frontend directory:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

### Step 2: Build and run your app
With Metro running, open a new terminal window/pane and use one of the following commands to build and run your app.

#### Android
Make sure:
1. Your **Android Emulator** is running, OR 
2. **USB debugging** is enabled on your physical connected phone.

```sh
# Using npx / React Native CLI
npx react-native run-android

# OR using npm
npm run android
```

#### iOS
For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).
```sh
bundle install
bundle exec pod install
```
Then run the app:
```sh
npx react-native run-ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

---

## ✍️ Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

---

## 🗺️ Architecture & System Design
The system architecture diagrams and database schemas are mapped out using Draw.io. You can find them in the root of the project:
* `system-architecture.drawio` - Contains the full Frontend -> Backend -> Database request flow.
* `database-schema.drawio` - Contains the Entity-Relationship mapping for MongoDB collections.

---

## 🔧 Troubleshooting

If you're having issues getting the above steps to work, see the official [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

Ensure your backend API base URL in your React Native code is pointing to your local machine's IP address (e.g., `http://192.168.x.x:5000/api`) and not `localhost`, as the Android emulator cannot resolve `localhost` directly to your development machine.

---
## 👥Team Details 
Group number: 
* Member 1: IT24103866 - Obesekara S.O.K.D - Food Reservation (User)
* Member 2: IT24101574 - Dhanapala N.N - User Management 
* Member 3: IT24104109 - Kavibarath S. - Feedback Management
* Member 4: IT24101666 - Nethmal J.A.D.D - Table Booking Management
* Member 5: IT24102699 - Mummullage B.U.T - Food Management (Restaurant)
* Member 6: IT24102308 - Mohommed M.H.S - Restaurant Profile Management 

## 📚 Learn More

To learn more about React Native, take a look at the following resources:
- [React Native Website](https://reactnative.dev)
- [Getting Started](https://reactnative.dev/docs/environment-setup)
- [Learn the Basics](https://reactnative.dev/docs/getting-started)
- [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps)

---
## 🧾GitHub Repository: https://github.com/Krishmal2004/Food-Reservation-App.git
