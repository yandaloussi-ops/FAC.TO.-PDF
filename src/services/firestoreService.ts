import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ==========================================
// 1. خدمات الكتب (Books Service)
// ==========================================
export const subscribeToBooks = (callback: (books: any[]) => void) => {
  const q = query(collection(db, 'books'));
  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(books);
  }, (err) => {
    console.error("Error subscribing to books:", err);
    callback([]);
  });
};

export const saveBookToFirestore = async (bookData: any) => {
  const bookId = bookData.id || `book_${Date.now()}`;
  const bookRef = doc(db, 'books', bookId);
  const payload = JSON.parse(JSON.stringify({
    ...bookData,
    id: bookId,
    updatedAt: new Date().toISOString()
  }));
  await setDoc(bookRef, payload, { merge: true });
};

export const deleteBookFromFirestore = async (bookId: string) => {
  await deleteDoc(doc(db, 'books', bookId));
};

// ==========================================
// 2. خدمات الأساتذة (Professors Service)
// ==========================================
export const subscribeToProfessors = (callback: (profs: any[]) => void) => {
  const q = query(collection(db, 'professors'));
  return onSnapshot(q, (snapshot) => {
    const profs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(profs);
  }, (err) => {
    console.error("Error subscribing to professors:", err);
    callback([]);
  });
};

export const saveProfessorToFirestore = async (profData: any) => {
  const profId = profData.id || `prof_${Date.now()}`;
  const profRef = doc(db, 'professors', profId);
  const payload = JSON.parse(JSON.stringify({
    ...profData,
    id: profId,
    createdAt: profData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  await setDoc(profRef, payload, { merge: true });
};

export const deleteProfessorFromFirestore = async (profId: string) => {
  await deleteDoc(doc(db, 'professors', profId));
};

// ==========================================
// 3. خدمات الطلاب (Students Service)
// ==========================================
export const subscribeToStudents = (callback: (students: any[]) => void) => {
  const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(students);
  }, (err) => console.error("Error subscribing to students:", err));
};

export const subscribeToStudentProfile = (studentId: string, callback: (student: any) => void) => {
  const studentRef = doc(db, 'students', studentId);
  return onSnapshot(studentRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    } else {
      callback(null);
    }
  }, (err) => console.error("Error subscribing to student profile:", err));
};

export const saveStudentToFirestore = async (studentData: any) => {
  const studentId = studentData.id || `std_${Date.now()}`;
  const studentRef = doc(db, 'students', studentId);
  const payload = JSON.parse(JSON.stringify({
    ...studentData,
    id: studentId,
    createdAt: studentData.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  await setDoc(studentRef, payload, { merge: true });
};

export const deleteStudentFromFirestore = async (studentId: string) => {
  await deleteDoc(doc(db, 'students', studentId));
};

// ==========================================
// 4. خدمات المعاملات المالية (Transactions Service)
// ==========================================
export const subscribeToTransactions = (callback: (txs: any[]) => void) => {
  const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(txs);
  }, (err) => console.error("Error subscribing to transactions:", err));
};

export const recordTransactionInFirestore = async (txData: any) => {
  const txId = txData.id || `tx_${Date.now()}`;
  const txRef = doc(db, 'transactions', txId);
  const payload = JSON.parse(JSON.stringify({
    ...txData,
    id: txId,
    createdAt: new Date().toISOString()
  }));
  await setDoc(txRef, payload, { merge: true });
};

// ==========================================
// 5. رفع الملفات إلى Firebase Storage
// ==========================================
export const uploadFileToStorage = async (file: File, folderPath: string): Promise<string> => {
  const storageRef = ref(storage, `${folderPath}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};
