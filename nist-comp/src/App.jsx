import React, { useState, useEffect } from 'react';
import './App.css'; 
import rawCsfData from './data/csf-data.json'; // Import the CSF data from JSON file


// Component for a single Category item
const CategoryItem = ({ category, updateCompliance }) => {
  const { id, name, description, status, notes } = category;


  const handleStatusChange = (e) => {
    updateCompliance(id, 'status', e.target.value);
  };


  const handleNotesChange = (e) => {
    updateCompliance(id, 'notes', e.target.value);
  };


  return (
    <div className="category-item">
      <h4 className="category-item-title">{id}: {name}</h4>
      <p className="category-item-description">{description}</p>


      <div className="status-radios">
        <label className="radio-label">
          <input
            type="radio"
            name={`status-${id}`}
            value="Yes"
            checked={status === 'Yes'}
            onChange={handleStatusChange}
            className="radio-input radio-green"
          />
          <span>Yes</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name={`status-${id}`}
            value="No"
            checked={status === 'No'}
            onChange={handleStatusChange}
            className="radio-input radio-red"
          />
          <span>No</span>
        </label>
        <label className="radio-label">
          <input
            type="radio"
            name={`status-${id}`}
            value="N/A"
            checked={status === 'N/A'}
            onChange={handleStatusChange}
            className="radio-input radio-blue"
          />
          <span>N/A</span>
        </label>
      </div>


      <div>
        <label htmlFor={`notes-${id}`} className="notes-label">Notes/Evidence:</label>
        <textarea
          id={`notes-${id}`}
          rows="3"
          value={notes}
          onChange={handleNotesChange}
          className="notes-area"
          placeholder="Add notes or evidence here..."
        ></textarea>
      </div>
    </div>
  );
};


// Main App component
function App() {
  const [csfData, setCsfData] = useState(null);
  const [complianceData, setComplianceData] = useState([]);
  const [showReport, setShowReport] = useState(false);
  const [loading, setLoading] = useState(true);


  // Simulate fetching compliance data when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
        setCsfData(rawCsfData); // Set the data from the imported JSON
        setLoading(false);
      } catch (error) {
        console.error("Error fetching CSF data:", error);
        setLoading(false);
      }
    };


    fetchData();
  }, []);


  // Initialize compliance data once csfData is loaded
  useEffect(() => {
    if (csfData) {
      const initialCompliance = csfData["CSF 2.0"].Functions.map(func => ({
        ...func,
        Categories: func.Categories.map(cat => ({
          ...cat,
          status: '', // Default status is empty
          notes: ''    // Default notes are empty
        }))
      }));
      setComplianceData(initialCompliance);
    }
  }, [csfData]);


  // Function to update the compliance status or notes for a specific category
  const updateCompliance = (categoryId, field, value) => {
    setComplianceData(prevData =>
      prevData.map(func => ({
        ...func,
        Categories: func.Categories.map(cat =>
          cat.id === categoryId ? { ...cat, [field]: value } : cat
        )
      }))
    );
  };


  // Function to toggle the report visibility
  const toggleReport = () => {
    setShowReport(!showReport);
  };


  // Calculate summary for the report
  const calculateSummary = () => {
    let met = 0;
    let notMet = 0;
    let notApplicable = 0;
    let pending = 0;


    complianceData.forEach(func => {
      func.Categories.forEach(cat => {
        if (cat.status === 'Yes') {
          met++;
        } else if (cat.status === 'No') {
          notMet++;
        } else if (cat.status === 'N/A') {
          notApplicable++;
        } else {
          pending++;
        }
      });
    });


    return { met, notMet, notApplicable, pending };
  };


  const summary = calculateSummary();


  const allFunctions = csfData ? csfData["CSF 2.0"].Functions : [];


  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-text">Loading CSF Data...</div>
      </div>
    );
  }


  return (
    <div className="app-container">
      <header className="app-header">
        <h1>NIST CSF 2.0 Compliance Checklist</h1>
        <p>Assess your organization's adherence to cybersecurity best practices.</p>
      </header>


      <main className="main-content">
        {allFunctions.length > 0 ? (
          allFunctions.map(func => (
            <section key={func.id} className="function-section">
              <h2>
                {func.id}: {func.name}
              </h2>
              <p>{func.description}</p>
              <div>
                {func.Categories.map(category => (
                  <CategoryItem
                    key={category.id}
                    category={complianceData.find(f => f.id === func.id)?.Categories.find(c => c.id === category.id) || category}
                    updateCompliance={updateCompliance}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center text-gray-600 text-xl py-10">No functions found or loaded.</div>
        )}


        <div className="report-button-container">
          <button
            onClick={toggleReport}
            className="report-button"
          >
            {showReport ? 'Hide Report' : 'Generate Compliance Report'}
          </button>
        </div>


        {showReport && (
          <section className="report-section">
            <h2>Compliance Report Summary</h2>
            <div className="report-summary-grid">
              <div className="summary-card green">
                <p className="label green">Controls Met</p>
                <p className="value green">{summary.met}</p>
              </div>
              <div className="summary-card red">
                <p className="label red">Controls Not Met</p>
                <p className="value red">{summary.notMet}</p>
              </div>
              <div className="summary-card blue">
                <p className="label blue">Not Applicable</p>
                <p className="value blue">{summary.notApplicable}</p>
              </div>
              <div className="summary-card yellow">
                <p className="label yellow">Pending Review</p>
                <p className="value yellow">{summary.pending}</p>
              </div>
            </div>


            <h3>Detailed Breakdown:</h3>
            {complianceData.map(func => (
              <div key={`report-${func.id}`} className="report-function-block">
                <h4>{func.name} Function</h4>
                <ul>
                  {func.Categories.map(cat => (
                    <li key={`report-cat-${cat.id}`} className="report-category-item">
                      <div>
                        <span className="font-semibold">{cat.id}: {cat.name}</span> -
                        <span className={`status ${
                          cat.status === 'Yes' ? 'green' :
                          cat.status === 'No' ? 'red' :
                          cat.status === 'N/A' ? 'blue' : 'yellow'
                        }`}>
                          {cat.status || 'Pending'}
                        </span>
                        {cat.notes && (
                          <p className="notes">Notes: {cat.notes}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}
      </main>


      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} NIST CSF 2.0 Compliance Tool. All rights reserved.</p>
      </footer>
    </div>
  );
}


export default App;
