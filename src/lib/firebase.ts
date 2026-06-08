import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey:            "AIzaSyC58sttIxCfvD0G4SItHEta7VFs448bcmY",
  authDomain:        "symply-7f93d.firebaseapp.com",
  projectId:         "symply-7f93d",
  storageBucket:     "symply-7f93d.firebasestorage.app",
  messagingSenderId: "68312830927",
  appId:             "1:68312830927:web:e8474605f556924e0678ba",
  measurementId:     "G-1RX1DPY55J",
}

export const app            = initializeApp(firebaseConfig)
export const auth           = getAuth(app)
export const db             = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
