import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyAFUtiLB-E_3XVNo3HgIByy8EnuQlXd4gM',
  authDomain: 'ecom-lifeshield.firebaseapp.com',
  projectId: 'ecom-lifeshield',
  storageBucket: 'ecom-lifeshield.firebasestorage.app',
  messagingSenderId: '388157007401',
  appId: '1:388157007401:web:ddefa4f6335a6fbcf35e38'
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { app, auth, googleProvider }
