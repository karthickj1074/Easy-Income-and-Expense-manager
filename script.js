```javascript
let transactions = [];
let editingId = null;


/* =====================================================
   LOAD DATA
===================================================== */

function loadData() {
  try {
    const saved = localStorage.getItem("transactions");

    if (!saved) {
      transactions = [];
      return;
    }

    const data = JSON.parse(saved);

    transactions = Array.isArray(data) ? data : [];

  } catch (error) {
    console.error("Load error:", error);
    transactions = [];
  }
}


/* =====================================================
   SAVE DATA
===================================================== */

function saveData() {
  try {
    localStorage.setItem(
      "transactions",
      JSON.stringify(transactions)
    );
  } catch (error) {
    console.error("Save error:", error);
    alert("Unable to save data in this browser.");
  }
}


/* =====================================================
   TODAY
===================================================== */

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* =====================================================
   FORMAT MONEY
===================================================== */

function formatMoney(value) {
  return (
    Number(value) || 0
  ).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}


/* =====================================================
   FORMAT DATE
===================================================== */

function formatDate(date) {
  if (!date) return "";

  const d = new Date(date + "T00:00:00");

  if (isNaN(d.getTime())) {
    return date;
  }

  return d.toLocaleDateString("en-IN");
}


/* =====================================================
   VALID DATE
===================================================== */

function isValidDate(value) {
  if (!value) return false;

  const d = new Date(
    String(value) + "T00:00:00"
  );

  return !isNaN(d.getTime());
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {
  const div = document.createElement("div");

  div.textContent = String(value || "");

  return div.innerHTML;
}


/* =====================================================
   ADD / UPDATE
===================================================== */

document
  .getElementById("transactionForm")
  .addEventListener("submit", function(event) {

    event.preventDefault();

    const description =
      document
        .getElementById("description")
        .value
        .trim();

    const amount =
      Number(
        document
          .getElementById("amount")
          .value
      );

    const type =
      document.getElementById("type").value;

    const category =
      document.getElementById("category").value;

    const date =
      document.getElementById("date").value;


    if (!description) {
      alert("Please enter a description.");
      return;
    }

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (!date) {
      alert("Please select a date.");
      return;
    }


    if (editingId !== null) {

      const index =
        transactions.findIndex(
          item => item.id === editingId
        );

      if (index !== -1) {

        transactions[index] = {
          id: editingId,
          description,
          amount,
          type,
          category,
          date
        };

      }

      alert(
        "Transaction updated successfully."
      );

      cancelEdit();

    } else {

      transactions.push({
        id:
          Date.now() +
          Math.floor(
            Math.random() * 1000000
          ),

        description,
        amount,
        type,
        category,
        date
      });

      alert(
        "Transaction added successfully."
      );
    }


    saveData();

    displayTransactions();

    document
      .getElementById("transactionForm")
      .reset();

    document.getElementById("date").value =
      getToday();

  });


/* =====================================================
   DISPLAY
===================================================== */

function displayTransactions() {

  let filtered = [...transactions];


  const searchText =
    document
      .getElementById("search")
      .value
      .toLowerCase()
      .trim();


  if (searchText) {

    filtered = filtered.filter(transaction => {

      const description =
        String(
          transaction.description || ""
        ).toLowerCase();

      const category =
        String(
          transaction.category || ""
        ).toLowerCase();

      return (
        description.includes(searchText) ||
        category.includes(searchText)
      );

    });

  }


  const filterType =
    document.getElementById(
      "filterType"
    ).value;


  if (filterType !== "all") {

    filtered = filtered.filter(
      transaction =>
        transaction.type === filterType
    );

  }


  const filterCategory =
    document.getElementById(
      "filterCategory"
    ).value;


  if (filterCategory !== "all") {

    filtered = filtered.filter(
      transaction =>
        transaction.category ===
        filterCategory
    );

  }


  const filterDate =
    document.getElementById(
      "filterDate"
    ).value;


  if (filterDate) {

    filtered = filtered.filter(
      transaction =>
        transaction.date === filterDate
    );

  }


  const sort =
    document.getElementById("sort").value;


  switch (sort) {

    case "newest":

      filtered.sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

      break;

    case "oldest":

      filtered.sort(
        (a, b) =>
          new Date(a.date) -
          new Date(b.date)
      );

      break;

    case "high":

      filtered.sort(
        (a, b) =>
          Number(b.amount) -
          Number(a.amount)
      );

      break;

    case "low":

      filtered.sort(
        (a, b) =>
          Number(a.amount) -
          Number(b.amount)
      );

      break;

    case "az":

      filtered.sort(
        (a, b) =>
          String(a.description || "")
            .localeCompare(
              String(b.description || "")
            )
      );

      break;

    case "za":

      filtered.sort(
        (a, b) =>
          String(b.description || "")
            .localeCompare(
              String(a.description || "")
            )
      );

      break;
  }


  const list =
    document.getElementById(
      "transactionList"
    );

  list.innerHTML = "";


  if (filtered.length === 0) {

    list.innerHTML = `
      <tr>
        <td colspan="6" class="no-data">
          No transactions found.
        </td>
      </tr>
    `;

    updateSummary();

    return;
  }


  filtered.forEach(transaction => {

    const row =
      document.createElement("tr");


    const isIncome =
      transaction.type === "income";


    const color =
      isIncome
        ? "income"
        : "expense";


    const sign =
      isIncome
        ? "+"
        : "-";


    row.innerHTML = `

      <td>
        ${formatDate(transaction.date)}
      </td>

      <td>
        ${escapeHTML(transaction.description)}
      </td>

      <td>
        ${escapeHTML(transaction.category)}
      </td>

      <td class="${color}">
        ${isIncome ? "Income" : "Expense"}
      </td>

      <td class="${color}">
        ${sign} ₹${formatMoney(transaction.amount)}
      </td>

      <td>

        <div class="action-buttons">

          <button
            class="edit-btn"
            onclick="editTransaction(${transaction.id})"
          >
            ✏️ Edit
          </button>

          <button
            class="delete-btn"
            onclick="deleteTransaction(${transaction.id})"
          >
            🗑️ Delete
          </button>

        </div>

      </td>
    `;


    list.appendChild(row);

  });


  updateSummary();
}


/* =====================================================
   SUMMARY
===================================================== */

function updateSummary() {

  let income = 0;
  let expense = 0;


  transactions.forEach(transaction => {

    const amount =
      Number(transaction.amount) || 0;


    if (transaction.type === "income") {
      income += amount;
    } else {
      expense += amount;
    }

  });


  const balance =
    income - expense;


  document.getElementById(
    "totalIncome"
  ).textContent =
    "₹" + formatMoney(income);


  document.getElementById(
    "totalExpense"
  ).textContent =
    "₹" + formatMoney(expense);


  document.getElementById(
    "balance"
  ).textContent =
    "₹" + formatMoney(balance);
}


/* =====================================================
   EDIT
===================================================== */

function editTransaction(id) {

  const transaction =
    transactions.find(
      item => item.id === id
    );


  if (!transaction) return;


  editingId = id;


  document.getElementById(
    "description"
  ).value =
    transaction.description;


  document.getElementById(
    "amount"
  ).value =
    transaction.amount;


  document.getElementById(
    "type"
  ).value =
    transaction.type;


  document.getElementById(
    "category"
  ).value =
    transaction.category;


  document.getElementById(
    "date"
  ).value =
    transaction.date;


  document.getElementById(
    "submitButton"
  ).textContent =
    "💾 Update Transaction";


  document.getElementById(
    "cancelEditButton"
  ).style.display =
    "block";


  document.getElementById(
    "editMessage"
  ).classList.add("active");


  document.getElementById(
    "transactionBox"
  ).classList.add("editing");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =====================================================
   CANCEL EDIT
===================================================== */

function cancelEdit() {

  editingId = null;


  document
    .getElementById("transactionForm")
    .reset();


  document.getElementById("date").value =
    getToday();


  document.getElementById(
    "submitButton"
  ).textContent =
    "➕ Add Transaction";


  document.getElementById(
    "cancelEditButton"
  ).style.display =
    "none";


  document.getElementById(
    "editMessage"
  ).classList.remove("active");


  document.getElementById(
    "transactionBox"
  ).classList.remove("editing");
}


/* =====================================================
   DELETE SINGLE TRANSACTION
===================================================== */

function deleteTransaction(id) {

  const transaction =
    transactions.find(
      item => item.id === id
    );


  if (!transaction) return;


  const confirmed =
    confirm(
      "Delete this transaction?\n\n" +
      transaction.description +
      " - ₹" +
      formatMoney(transaction.amount)
    );


  if (!confirmed) return;


  transactions =
    transactions.filter(
      item => item.id !== id
    );


  saveData();

  displayTransactions();
}


/* =====================================================
   CLEAR FILTERS
===================================================== */

function clearFilters() {

  document.getElementById(
    "search"
  ).value = "";


  document.getElementById(
    "filterType"
  ).value = "all";


  document.getElementById(
    "filterCategory"
  ).value = "all";


  document.getElementById(
    "filterDate"
  ).value = "";


  document.getElementById(
    "sort"
  ).value = "newest";


  displayTransactions();
}


/* =====================================================
   IMPORT
===================================================== */

function openImport() {

  document
    .getElementById("importFile")
    .click();
}


document
  .getElementById("importFile")
  .addEventListener(
    "change",
    function(event) {

      const file =
        event.target.files[0];


      if (!file) return;


      const reader =
        new FileReader();


      reader.onload =
        function(e) {

          try {

            const data =
              JSON.parse(e.target.result);


            let imported = [];


            if (
              data &&
              Array.isArray(
                data.transactions
              )
            ) {

              imported =
                data.transactions;

            } else if (
              Array.isArray(data)
            ) {

              imported = data;

            } else {

              throw new Error(
                "Invalid backup"
              );

            }


            imported =
              imported.map(item => {

                const amount =
                  Number(item.amount);


                return {

                  id:
                    Date.now() +
                    Math.floor(
                      Math.random() *
                      100000000
                    ),

                  description:
                    String(
                      item.description ||
                      "Unknown"
                    ),

                  amount:
                    amount >= 0
                      ? amount
                      : 0,

                  type:
                    item.type === "expense"
                      ? "expense"
                      : "income",

                  category:
                    String(
                      item.category ||
                      "Other"
                    ),

                  date:
                    isValidDate(item.date)
                      ? item.date
                      : getToday()

                };

              });


            if (imported.length === 0) {

              alert(
                "No valid transactions found."
              );

              return;
            }


            const replace =
              confirm(
                "Found " +
                imported.length +
                " transactions.\n\n" +
                "OK = Replace existing data\n" +
                "Cancel = Add to existing data"
              );


            if (replace) {

              transactions = imported;

            } else {

              transactions = [
                ...transactions,
                ...imported
              ];

            }


            saveData();

            displayTransactions();


            alert(
              "Import completed successfully!"
            );

          }

          catch(error) {

            console.error(error);

            alert(
              "Import failed. Please select a valid JSON backup file."
            );

          }


          event.target.value = "";

        };


      reader.readAsText(file);

    }
  );


/* =====================================================
   EXPORT EXCEL
===================================================== */

function exportExcel() {

  if (transactions.length === 0) {

    alert(
      "There are no transactions to export."
    );

    return;
  }


  if (typeof XLSX === "undefined") {

    alert(
      "Excel library is not loaded. Please check your internet connection."
    );

    return;
  }


  const excelData =
    transactions.map(transaction => ({

      Date:
        transaction.date || "",

      Description:
        transaction.description || "",

      Category:
        transaction.category || "",

      Type:
        transaction.type === "income"
          ? "Income"
          : "Expense",

      Amount:
        Number(transaction.amount) || 0

    }));


  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    );


  worksheet["!cols"] = [
    { wch: 15 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 }
  ];


  const workbook =
    XLSX.utils.book_new();


  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    "Transactions"
  );


  let totalIncome = 0;
  let totalExpense = 0;


  transactions.forEach(transaction => {

    const amount =
      Number(transaction.amount) || 0;


    if (transaction.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

  });


  const summaryData = [

    {
      Item: "Total Income",
      Amount: totalIncome
    },

    {
      Item: "Total Expense",
      Amount: totalExpense
    },

    {
      Item: "Balance",
      Amount:
        totalIncome - totalExpense
    }

  ];


  const summarySheet =
    XLSX.utils.json_to_sheet(
      summaryData
    );


  XLSX.utils.book_append_sheet(
    workbook,
    summarySheet,
    "Summary"
  );


  XLSX.writeFile(
    workbook,
    "Income-Expense-" +
    getToday() +
    ".xlsx"
  );


  alert(
    "Excel file exported successfully!"
  );
}


/* =====================================================
   EXPORT PDF
===================================================== */

function exportPDF() {

  if (transactions.length === 0) {

    alert(
      "There are no transactions to export."
    );

    return;
  }


  if (
    typeof window.jspdf ===
    "undefined"
  ) {

    alert(
      "PDF library is not loaded. Please check your internet connection."
    );

    return;
  }


  const { jsPDF } =
    window.jspdf;


  const doc =
    new jsPDF();


  let totalIncome = 0;
  let totalExpense = 0;


  transactions.forEach(transaction => {

    const amount =
      Number(transaction.amount) || 0;


    if (transaction.type === "income") {
      totalIncome += amount;
    } else {
      totalExpense += amount;
    }

  });


  const balance =
    totalIncome - totalExpense;


  doc.setFontSize(20);

  doc.setTextColor(
    37,
    99,
    235
  );


  doc.text(
    "Income & Expense Report",
    14,
    20
  );


  doc.setFontSize(10);

  doc.setTextColor(
    80,
    80,
    80
  );


  doc.text(
    "Generated: " +
    new Date().toLocaleDateString(
      "en-IN"
    ),
    14,
    28
  );


  doc.setFontSize(11);


  doc.setTextColor(
    22,
    163,
    74
  );


  doc.text(
    "Income: ₹" +
    formatMoney(totalIncome),
    14,
    40
  );


  doc.setTextColor(
    220,
    38,
    38
  );


  doc.text(
    "Expense: ₹" +
    formatMoney(totalExpense),
    75,
    40
  );


  doc.setTextColor(
    37,
    99,
    235
  );


  doc.text(
    "Balance: ₹" +
    formatMoney(balance),
    145,
    40
  );


  const tableData =
    transactions.map(transaction => [

      formatDate(transaction.date),

      String(
        transaction.description || ""
      ),

      String(
        transaction.category || ""
      ),

      transaction.type === "income"
        ? "Income"
        : "Expense",

      "₹" +
      formatMoney(
        transaction.amount
      )

    ]);


  doc.autoTable({

    startY: 50,

    head: [[
      "Date",
      "Description",
      "Category",
      "Type",
      "Amount"
    ]],

    body: tableData,

    theme: "striped",

    headStyles: {
      fillColor: [
        37,
        99,
        235
      ],
      textColor: 255
    },

    styles: {
      fontSize: 9,
      cellPadding: 3
    }

  });


  doc.save(
    "Income-Expense-" +
    getToday() +
    ".pdf"
  );


  alert(
    "PDF exported successfully!"
  );
}


/* =====================================================
   EVENTS
===================================================== */

document
  .getElementById("search")
  .addEventListener(
    "input",
    displayTransactions
  );


document
  .getElementById("filterType")
  .addEventListener(
    "change",
    displayTransactions
  );


document
  .getElementById("filterCategory")
  .addEventListener(
    "change",
    displayTransactions
  );


document
  .getElementById("filterDate")
  .addEventListener(
    "change",
    displayTransactions
  );


document
  .getElementById("sort")
  .addEventListener(
    "change",
    displayTransactions
  );


/* =====================================================
   START
===================================================== */

loadData();

document.getElementById("date").value =
  getToday();

displayTransactions();
```
