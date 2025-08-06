import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { FaMoon, FaSun } from 'react-icons/fa'; // Add this import
import axios from "axios";
import React, { useRef } from 'react';

function App() {
  const initialForm = {
    fullName: "",
    gender: "",
    dateOfBirth: getTodayDate(),
    studentPicture: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    guardianName: "",
    guardianRelation: "",
    previousSchool: "",
    lastClass: "",
    admissionClass: "",
    admissionDate: getTodayDate()
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // returns 'YYYY-MM-DD'
  };

  const [form, setForm] = useState(initialForm)
  const [student, setStudent] = useState([])
  const [editId, setEditId] = useState(null);
  const [theme, setTheme] = useState('light');
  const fileInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [GenderSearch, setGenderSearch] = useState("")

  const filtered = student
    .filter(item =>
      GenderSearch.trim() === "" ||
      (item.gender && item.gender.toLowerCase() === GenderSearch.toLowerCase())
    )
    .filter(item =>
      search.trim() === "" ||
      (item.fullName && item.fullName.toLowerCase().includes(search.toLowerCase()))
    );


  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  // Load users on page load
  useEffect(() => {
    getStudents();
    getNextStudentId(); // Add this


    const savedTheme = localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };


  const formatDate = (isoDate) => {
    return isoDate ? isoDate.split('T')[0] : '';
  };

  const API_URL = import.meta.env.VITE_API_URL.replace(/\/+$/, "");


  // DELETE student
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`${API_URL}/api/students/delete/${id}`);
      alert("Student deleted successfully!");
      getStudents(); // refresh the list
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Error deleting student.");
    }
  };

  // EDIT student
  const handleEdit = (studentData) => {
    setForm({
      ...studentData,
      dateOfBirth: formatDate(studentData.dateOfBirth),
      admissionDate: formatDate(studentData.admissionDate),
    }); // Pre-fill the form with student data
    setEditId(studentData._id); // store the id to know we're editing
  };

  // GET next student ID
  const getNextStudentId = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students/next-id`);
      setForm((student) => ({ ...student, studentId: res.data.nextStudentId }));
    } catch (err) {
      console.error("Error fetching next ID:", err);
    }
  };

  // GET all students
  const getStudents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/students/all`);
      setStudent(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  // Convert image to base64
  const convertToBase64 = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, studentPicture: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // SUBMIT form (add or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);

    if (!form.studentPicture) {
      alert("Please upload a picture!");
      return;
    }

    try {
      if (editId) {
        await axios.put(`${API_URL}/api/students/update/${editId}`, form);
      } else {
        const res = await axios.post(`${API_URL}/api/students/add`, form);
        console.log("Student added:", res.data);
        alert("Successfully Added..")
      }
      setForm(initialForm);
      setEditId(null);
      getStudents();
      getNextStudentId();
    } catch (error) {
      alert("Please fill the field correctly.")
      console.error("Submit error:", error.response?.data || error.message);
    }
  };

  // const handleDelete = async (id) => {
  //   const confirmDelete = window.confirm("Are you sure you want to delete this student?");
  //   if (!confirmDelete) return;

  //   try {
  //     await axios.delete(`http://localhost:5000/api/students/delete/${id}`);
  //     alert("Student deleted successfully!");
  //     getStudents(); // refresh the list
  //   } catch (err) {
  //     console.error("Delete failed:", err);
  //     alert("Error deleting student.");
  //   }
  // };


  // const handleEdit = (studentData) => {
  //   setForm({
  //     ...studentData,
  //     dateOfBirth: formatDate(studentData.dateOfBirth),
  //     admissionDate: formatDate(studentData.admissionDate),
  //   }); // Pre-fill the form with student data
  //   setEditId(studentData._id); // store the id to know we're editin
  // };


  // const getNextStudentId = async () => {
  //   try {
  //     const res = await axios.get("http://localhost:5000/api/students/next-id");
  //     setForm((student) => ({ ...student, studentId: res.data.nextStudentId }));
  //   } catch (err) {
  //     console.error("Error fetching next ID:", err);
  //   }
  // };

  // const getStudents = async () => {
  //   const res = await axios.get("http://localhost:5000/api/students/all");
  //   setStudent(res.data);
  // }

  // const convertToBase64 = (e) => {
  //   const file = e.target.files[0];
  //   const reader = new FileReader();
  //   reader.onloadend = () => {
  //     setForm({ ...form, studentPicture: reader.result });
  //   };
  //   reader.readAsDataURL(file);
  // };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   console.log("Submitting form:", form); // More descriptive
  //   if (!form.studentPicture) {
  //     alert("Please upload a picture!");
  //     return;
  //   }

  //   try {
  //     if (editId) {
  //       // Update student
  //       await axios.put(`http://localhost:5000/api/students/update/${editId}`, form);
  //     } else {
  //       // Add new student
  //       const res = await axios.post("http://localhost:5000/api/students/add", form);
  //       console.log("Student added:", res.data); // Shows what backend returns
  //     }
  //     setForm(initialForm);
  //     setEditId(null); // clear editing
  //     getStudents();   // refresh list
  //     getNextStudentId();
  //   } catch (error) {
  //     console.error("Submit error:", error.response?.data || error.message);
  //   }
  // };


  return (
    <>
      <div className="app-container">

        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? <FaMoon /> : <FaSun />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>

        <div className="form-container">
          <h1>{editId ? "Edit Student Record" : "Student Admission Form"}</h1>
          <form onSubmit={handleSubmit} className="form-grid">
            {/* Student ID */}
            <div className="form-group">
              <label>Student ID</label>
              <input type="text" value={form.studentId || ""} readOnly />
            </div>

            {/* Personal Information */}
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                name='fullName'
                placeholder='Enter full name'
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                name="gender"
                id="gender"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              >
                <option value="">-- Select Gender --</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="date">Date of Birth</label>
              <input
                type="date"
                name='date'
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              />
            </div>

            {/* Contact Information */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name='email'
                placeholder='student@example.com'
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                name='phone'
                oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                placeholder='034323567890'
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Address Information */}
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name='address'
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="city">City</label>
              <input
                type="text"
                name='city'
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                type="text"
                name='state'
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                name='country'
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </div>

            {/* Guardian Information */}
            <div className="form-group">
              <label htmlFor="guardian">Guardian Name</label>
              <input
                type="text"
                name='guardian'
                value={form.guardianName}
                onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="guardianRelation">Guardian Relation</label>
              <input
                type="text"
                name='guardianRelation'
                value={form.guardianRelation}
                onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
              />
            </div>

            {/* Academic Information */}
            <div className="form-group">
              <label htmlFor="PreviousSchool">Previous School</label>
              <input
                type="text"
                name='PreviousSchool'
                value={form.previousSchool}
                onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="PreviousClass">Previous Class</label>
              <input
                type="text"
                name='PreviousClass'
                value={form.lastClass}
                onChange={(e) => setForm({ ...form, lastClass: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="AdmissionClass">Admission Class</label>
              <input
                type="text"
                name='AdmissionClass'
                value={form.admissionClass}
                onChange={(e) => setForm({ ...form, admissionClass: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="AdmissionDate">Admission Date</label>
              <input
                type="date"
                name='AdmissionDate'
                value={form.admissionDate}
                onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Student Photo</label>
              <div className="custom-file-upload">
                <button
                  type="button"
                  className="upload-btn"
                  onClick={handleButtonClick}
                >
                  Choose File
                </button>
                <span className="file-name">
                  {form.studentPicture ? 'File selected' : 'No file chosen'}
                </span>
                <input
                  type="file"
                  ref={fileInputRef}
                  name="choseImage"
                  onChange={convertToBase64}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
            </div>

            <button type='submit' className="submit-btn">
              {editId ? "Update Student" : "Submit Admission"}
            </button>
          </form>
        </div>

        <div className="students-container">
          <h1>Student Records</h1>
          {student.length === 0 ? (
            <div className="no-records">No student records found</div>
          ) : (
            <>
              <div className="searchcontainer">
                <div className="genderSearch">
                  <label htmlFor="gender" className='genderlbl'>Gender</label>
                  <select
                    className='gendersearching'
                    name="gender"
                    id="gender"
                    value={GenderSearch}
                    onChange={(e) => setGenderSearch(e.target.value)}
                  >
                    <option value="">-- All --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="divSearch">
                  <label htmlFor="search" className='serachlbl'>Search</label>
                  <input className='searchinput' type="text" name="search" placeholder='Search'
                    value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <table className="students-table">
                <thead>
                  <tr>
                    <th className='c1'>ID</th>
                    <th className='c2'>Name</th>
                    <th className='c3'>Gender</th>
                    <th className='c4'>Class</th>
                    <th className='c5'>Email</th>
                    <th className='c6'>Phone</th>
                    <th className='c7'>Photo</th>
                    <th className='c8'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((std, index) => (
                    <tr key={index}>
                      <td>{std.studentId}</td>
                      <td>{std.fullName}</td>
                      <td>{std.gender}</td>
                      <td>{std.admissionClass}</td>
                      <td>{std.email}</td>
                      <td>{std.phone}</td>
                      <td>
                        <img
                          className="student-img"
                          src={std.studentPicture || 'https://via.placeholder.com/40'}
                          alt="Student" />
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleEdit(std)}
                          >
                            Edit
                          </button>
                          <button
                            className="action-btn delete-btn"
                            onClick={() => handleDelete(std._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></>
          )}
        </div>
      </div>
    </>
  )
}

export default App










// import { useState, useEffect } from 'react'
// import { FaMoon, FaSun, FaPlus, FaBars, FaTimes, FaHome, FaUserGraduate, FaChartBar, FaCog } from 'react-icons/fa';
// import axios from "axios";
// import React, { useRef } from 'react';
// import './App.css';

// function App() {
//   const initialForm = {
//     fullName: "",
//     gender: "",
//     dateOfBirth: "",
//     studentPicture: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     state: "",
//     country: "",
//     guardianName: "",
//     guardianRelation: "",
//     previousSchool: "",
//     lastClass: "",
//     admissionClass: "",
//     admissionDate: ""
//   };

//   const [form, setForm] = useState(initialForm)
//   const [student, setStudent] = useState([])
//   const [editId, setEditId] = useState(null);
//   const [theme, setTheme] = useState('light');
//   const [showForm, setShowForm] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(true);
//   const [activeView, setActiveView] = useState('dashboard');
//   const fileInputRef = useRef(null);

//   const handleButtonClick = () => {
//     fileInputRef.current.click();
//   };

//   // Load users on page load
//   useEffect(() => {
//     getStudents();
//     getNextStudentId();

//     const savedTheme = localStorage.getItem('theme') ||
//       (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
//     setTheme(savedTheme);
//     document.documentElement.setAttribute('data-theme', savedTheme);
//   }, []);

//   const toggleTheme = () => {
//     const newTheme = theme === 'light' ? 'dark' : 'light';
//     setTheme(newTheme);
//     localStorage.setItem('theme', newTheme);
//     document.documentElement.setAttribute('data-theme', newTheme);
//   };

//   const formatDate = (isoDate) => {
//     return isoDate ? isoDate.split('T')[0] : '';
//   };

//   const handleDelete = async (id) => {
//     const confirmDelete = window.confirm("Are you sure you want to delete this student?");
//     if (!confirmDelete) return;

//     try {
//       await axios.delete(`http://localhost:5000/api/students/delete/${id}`);
//       alert("Student deleted successfully!");
//       getStudents();
//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Error deleting student.");
//     }
//   };

//   const handleEdit = (studentData) => {
//     setForm({
//       ...studentData,
//       dateOfBirth: formatDate(studentData.dateOfBirth),
//       admissionDate: formatDate(studentData.admissionDate),
//     });
//     setEditId(studentData._id);
//     setShowForm(true);
//   };

//   const getNextStudentId = async () => {
//     try {
//       const res = await axios.get("http://localhost:5000/api/students/next-id");
//       setForm((student) => ({ ...student, studentId: res.data.nextStudentId }));
//     } catch (err) {
//       console.error("Error fetching next ID:", err);
//     }
//   };

//   const getStudents = async () => {
//     const res = await axios.get("http://localhost:5000/api/students/all");
//     setStudent(res.data);
//   }

//   const convertToBase64 = (e) => {
//     const file = e.target.files[0];
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setForm({ ...form, studentPicture: reader.result });
//     };
//     reader.readAsDataURL(file);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!form.studentPicture) {
//       alert("Please upload a picture!");
//       return;
//     }

//     try {
//       if (editId) {
//         await axios.put(`http://localhost:5000/api/students/update/${editId}`, form);
//       } else {
//         const res = await axios.post("http://localhost:5000/api/students/add", form);
//         console.log("Student added:", res.data);
//       }
//       setForm(initialForm);
//       setEditId(null);
//       getStudents();
//       getNextStudentId();
//       setShowForm(false);
//     } catch (error) {
//       console.error("Submit error:", error.response?.data || error.message);
//     }
//   };

//   const toggleSidebar = () => {
//     setSidebarOpen(!sidebarOpen);
//   };

//   const handleNewStudent = () => {
//     setForm(initialForm);
//     setEditId(null);
//     getNextStudentId();
//     setShowForm(true);
//   };

//   return (
//     <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
//       {/* Sidebar */}
//       <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
//         <div className="sidebar-header">
//           <h2>School Admin</h2>
//           <button className="sidebar-toggle" onClick={toggleSidebar}>
//             {sidebarOpen ? <FaTimes /> : <FaBars />}
//           </button>
//         </div>
//         <nav className="sidebar-nav">
//           <ul>
//             <li className={activeView === 'dashboard' ? 'active' : ''} onClick={() => setActiveView('dashboard')}>
//               <FaHome /> {sidebarOpen && <span>Dashboard</span>}
//             </li>
//             <li className={activeView === 'students' ? 'active' : ''} onClick={() => { setActiveView('students'); setShowForm(false); }}>
//               <FaUserGraduate /> {sidebarOpen && <span>Students</span>}
//             </li>
//             <li className={activeView === 'reports' ? 'active' : ''} onClick={() => setActiveView('reports')}>
//               <FaChartBar /> {sidebarOpen && <span>Reports</span>}
//             </li>
//             <li className={activeView === 'settings' ? 'active' : ''} onClick={() => setActiveView('settings')}>
//               <FaCog /> {sidebarOpen && <span>Settings</span>}
//             </li>
//           </ul>
//         </nav>
//         <div className="sidebar-footer">
//           <button className="theme-toggle" onClick={toggleTheme}>
//             {theme === 'light' ? <FaMoon /> : <FaSun />}
//             {sidebarOpen && (theme === 'light' ? 'Dark Mode' : 'Light Mode')}
//           </button>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="main-content">
//         <div className="content-header">
//           <h1>{activeView === 'students' ? 'Student Management' : 'Dashboard'}</h1>
//           {activeView === 'students' && (
//             <button className="add-student-btn" onClick={handleNewStudent}>
//               <FaPlus /> Add Student
//             </button>
//           )}
//         </div>

//         {activeView === 'students' ? (
//           <div className="students-container">
//             {showForm ? (
//               <div className="form-container">
//                 <h2>{editId ? "Edit Student Record" : "Add New Student"}</h2>
//                 <form onSubmit={handleSubmit} className="form-grid">
//                   {/* Student ID */}
//                   <div className="form-group">
//                     <label>Student ID</label>
//                     <input type="text" value={form.studentId || ""} readOnly />
//                   </div>

//                   {/* Personal Information */}
//                   <div className="form-group">
//                     <label htmlFor="name">Full Name</label>
//                     <input
//                       type="text"
//                       name='fullName'
//                       placeholder='Enter full name'
//                       value={form.fullName}
//                       onChange={(e) => setForm({ ...form, fullName: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="gender">Gender</label>
//                     <select
//                       name="gender"
//                       id="gender"
//                       value={form.gender}
//                       onChange={(e) => setForm({ ...form, gender: e.target.value })}
//                     >
//                       <option value="">-- Select Gender --</option>
//                       <option value="Male">Male</option>
//                       <option value="Female">Female</option>
//                       <option value="Other">Other</option>
//                     </select>
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="date">Date of Birth</label>
//                     <input
//                       type="date"
//                       name='date'
//                       value={form.dateOfBirth}
//                       onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
//                     />
//                   </div>

//                   {/* Contact Information */}
//                   <div className="form-group">
//                     <label htmlFor="email">Email</label>
//                     <input
//                       type="email"
//                       name='email'
//                       placeholder='student@example.com'
//                       value={form.email}
//                       onChange={(e) => setForm({ ...form, email: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="phone">Phone</label>
//                     <input
//                       type="text"
//                       name='phone'
//                       placeholder='+1234567890'
//                       value={form.phone}
//                       onChange={(e) => setForm({ ...form, phone: e.target.value })}
//                     />
//                   </div>

//                   {/* Address Information */}
//                   <div className="form-group">
//                     <label htmlFor="address">Address</label>
//                     <input
//                       type="text"
//                       name='address'
//                       value={form.address}
//                       onChange={(e) => setForm({ ...form, address: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="city">City</label>
//                     <input
//                       type="text"
//                       name='city'
//                       value={form.city}
//                       onChange={(e) => setForm({ ...form, city: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="state">State</label>
//                     <input
//                       type="text"
//                       name='state'
//                       value={form.state}
//                       onChange={(e) => setForm({ ...form, state: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="country">Country</label>
//                     <input
//                       type="text"
//                       name='country'
//                       value={form.country}
//                       onChange={(e) => setForm({ ...form, country: e.target.value })}
//                     />
//                   </div>

//                   {/* Guardian Information */}
//                   <div className="form-group">
//                     <label htmlFor="guardian">Guardian Name</label>
//                     <input
//                       type="text"
//                       name='guardian'
//                       value={form.guardianName}
//                       onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="guardianRelation">Guardian Relation</label>
//                     <input
//                       type="text"
//                       name='guardianRelation'
//                       value={form.guardianRelation}
//                       onChange={(e) => setForm({ ...form, guardianRelation: e.target.value })}
//                     />
//                   </div>

//                   {/* Academic Information */}
//                   <div className="form-group">
//                     <label htmlFor="PreviousSchool">Previous School</label>
//                     <input
//                       type="text"
//                       name='PreviousSchool'
//                       value={form.previousSchool}
//                       onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="PreviousClass">Previous Class</label>
//                     <input
//                       type="text"
//                       name='PreviousClass'
//                       value={form.lastClass}
//                       onChange={(e) => setForm({ ...form, lastClass: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="AdmissionClass">Admission Class</label>
//                     <input
//                       type="text"
//                       name='AdmissionClass'
//                       value={form.admissionClass}
//                       onChange={(e) => setForm({ ...form, admissionClass: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label htmlFor="AdmissionDate">Admission Date</label>
//                     <input
//                       type="date"
//                       name='AdmissionDate'
//                       value={form.admissionDate}
//                       onChange={(e) => setForm({ ...form, admissionDate: e.target.value })}
//                     />
//                   </div>

//                   <div className="form-group">
//                     <label>Student Photo</label>
//                     <div className="custom-file-upload">
//                       <button
//                         type="button"
//                         className="upload-btn"
//                         onClick={handleButtonClick}
//                       >
//                         Choose File
//                       </button>
//                       <span className="file-name">
//                         {form.studentPicture ? 'File selected' : 'No file chosen'}
//                       </span>
//                       <input
//                         type="file"
//                         ref={fileInputRef}
//                         name="choseImage"
//                         onChange={convertToBase64}
//                         accept="image/*"
//                         style={{ display: 'none' }}
//                       />
//                     </div>
//                   </div>

//                   <div className="form-actions">
//                     <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
//                       Cancel
//                     </button>
//                     <button type='submit' className="submit-btn">
//                       {editId ? "Update Student" : "Add Student"}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             ) : (
//               <>
//                 {student.length === 0 ? (
//                   <div className="no-records">
//                     <p>No student records found</p>
//                     <button className="add-student-btn" onClick={handleNewStudent}>
//                       <FaPlus /> Add First Student
//                     </button>
//                   </div>
//                 ) : (
//                   <div className="students-table-container">
//                     <table className="students-table">
//                       <thead>
//                         <tr>
//                           <th>ID</th>
//                           <th>Name</th>
//                           <th>Gender</th>
//                           <th>Class</th>
//                           <th>Email</th>
//                           <th>Phone</th>
//                           <th>Photo</th>
//                           <th>Actions</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {student.map((std, index) => (
//                           <tr key={index}>
//                             <td>{std.studentId}</td>
//                             <td>{std.fullName}</td>
//                             <td>{std.gender}</td>
//                             <td>{std.admissionClass}</td>
//                             <td>{std.email}</td>
//                             <td>{std.phone}</td>
//                             <td>
//                               <img
//                                 className="student-img"
//                                 src={std.studentPicture || 'https://via.placeholder.com/40'}
//                                 alt="Student"
//                               />
//                             </td>
//                             <td>
//                               <div className="action-btns">
//                                 <button
//                                   className="action-btn edit-btn"
//                                   onClick={() => handleEdit(std)}
//                                 >
//                                   Edit
//                                 </button>
//                                 <button
//                                   className="action-btn delete-btn"
//                                   onClick={() => handleDelete(std._id)}
//                                 >
//                                   Delete
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         ) : (
//           <div className="dashboard-container">
//             <h2>Welcome to School Dashboard</h2>
//             <div className="stats-cards">
//               <div className="stat-card">
//                 <h3>Total Students</h3>
//                 <p>{student.length}</p>
//               </div>
//               <div className="stat-card">
//                 <h3>Male Students</h3>
//                 <p>{student.filter(s => s.gender === 'Male').length}</p>
//               </div>
//               <div className="stat-card">
//                 <h3>Female Students</h3>
//                 <p>{student.filter(s => s.gender === 'Female').length}</p>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;