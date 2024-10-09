function getColumnIndex(columnName) {
    const columnMap = {
        'id': 0,
        'job': 1,
        'esp_app_name': 2,
        'last_run': 3,
        'prefix': 4,
        'type': 5,
        'remedy_support_group': 6,
        'snow_support_group': 7,
        'snow_support_group_mgr': 8,
        'support_market': 9,
        'app_name': 10,
        'ldap_group': 11,
        'env': 12,
        'purpose': 13,
        'job_owner': 14,
        'troux_name': 15,
        'troux_id': 16,
        'status': 17,  // Dropdown column
        'impact': 18,  // Dropdown column
        'complexity': 19,  // Dropdown column
        'remarks': 20,
        'sign_off_name': 21,
        'sign_off_date': 22,
        'target_week': 23
    };

    // Return the column index or -1 if the column name doesn't exist
    return columnMap[columnName] || -1;
}

$(document).ready(function() {
  let currentPage = 1; 
  let totalCount = 0;  
  let loading = false; 
  let hasTotalCountDisplayed = false; 

// Define dropdown options for specific columns
const dropdownOptions = {
    'status': ['Active', 'Inactive'],
    'impact': ['Low', 'Medium', 'High'],
    'complexity': ['Low', 'Medium', 'High']
};



// Function to load jobs and render the table with dropdowns for specified columns
function loadJobs(page = 1, company = '') {
    if (loading) return;
    loading = true;

    $.get(`/api/jobs?page=${page}&limit=20&company=${encodeURIComponent(company)}`, function(response) {
        let jobs = response.jobs;

        if (!hasTotalCountDisplayed || company) {
            totalCount = response.total_count;
            $('#rowCount').text(`Total Jobs: ${totalCount}`);
            hasTotalCountDisplayed = true;
        }

        let tableBody = $('#jobTableBody');
        jobs.forEach(function(job) {
            let row = `
                <tr>
                    <td><input type="checkbox" class="rowCheckbox" data-id="${job.id}"></td>
                    <td>${job.job}</td>
                    <td>${job.event}</td>
                    <td>${job.last_run}</td>
                    <td>${job.prefix}</td>
                    <td>${job.type}</td>
                    <td>${job.remedy_support_group}</td>
                    <td>${job.snow_support_group}</td>
                    <td>${job.snow_support_group_mgr}</td>
                    <td>${job.support_market}</td>
                    <td>${job.app_name}</td>
                    <td>${job.ldap_group}</td>
                    <td>${job.env}</td>
                    <td>${job.purpose}</td>
                    <td contenteditable="true" data-column="job_owner" data-id="${job.id}">${job.job_owner}</td>
                    <td contenteditable="true" data-column="troux_name" data-id="${job.id}">${job.troux_name}</td>
                    <td contenteditable="true" data-column="troux_id" data-id="${job.id}">${job.troux_id}</td>
                    <td>
                       <select class="dropdown" data-column="status" data-id="${job.id}">
                           ${dropdownOptions['status'].map(option => `<option value="${option}" ${option === job.status ? 'selected' : ''}>${option}</option>`).join('')}
                       </select>
                    </td>
                    <td>
                       <select class="dropdown" data-column="impact" data-id="${job.id}">
                           ${dropdownOptions['impact'].map(option => `<option value="${option}" ${option === job.impact ? 'selected' : ''}>${option}</option>`).join('')}
                       </select>
                    </td>
                    <td>
                       <select class="dropdown" data-column="complexity" data-id="${job.id}">
                           ${dropdownOptions['complexity'].map(option => `<option value="${option}" ${option === job.complexity ? 'selected' : ''}>${option}</option>`).join('')}
                       </select>
                    </td>

                    <td contenteditable="true" data-column="remarks" data-id="${job.id}">${job.remarks}</td>
                    <td contenteditable="true" data-column="sign_off_name" data-id="${job.id}">${job.sign_off_name}</td>
                    <td>${job.sign_off_date}</td>
                    <td contenteditable="true" data-column="target_week" data-id="${job.id}">${job.target_week}</td>
                </tr>
            `;
            tableBody.append(row);
        });

        currentPage += 1;
        loading = false;
    });
}

// Handle dropdown change events for specific columns
$('#jobTableBody').on('change', '.dropdown', function() {
    const jobId = $(this).data('id');
    const column = $(this).data('column');
    const newValue = $(this).val();

    console.log(`Debug: Updating Job ID: ${jobId}, Column: ${column}, New Value: ${newValue}`);

    // Send the update to the backend
    $.ajax({
        url: '/api/single_update',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ job_id: jobId, field: column, value: newValue }),
        success: function(response) {
            console.log(`Debug: Update successful for Job ID ${jobId}, Column: ${column}`);
            Toastify({
                text: "Update successful!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();
        },
        error: function(error) {
            console.log(`Error updating Job ID ${jobId}:`, error);
            alert('Error updating job. Please try again.');
        }
    });
});


  $(window).on('scroll', function() {
      if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100) {
          loadJobs(currentPage); 
      }
  });
  
  $('#companySelect').on('change', function() {
      const selectedCompany = $(this).val();
      currentPage = 1; 
      $('#jobTableBody').empty(); 
      hasTotalCountDisplayed = false; 
      loadJobs(currentPage, selectedCompany); 
  });

  function loadCompanies() {
      $.get('/api/companies', function(companies) {
          let companySelect = $('#companySelect');
          companySelect.empty();
          companySelect.append('<option value="">All Companies</option>');
          companies.forEach(function(company) {
              companySelect.append(`<option value="${company}">${company}</option>`);
          });
      });
  }

  loadCompanies();
  loadJobs();

function debounce(func, delay) {
  let debounceTimer;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => func.apply(context, args), delay);
  };
}

function applyFilters() {
    const filters = {
        job: $('#filterJobName').val().trim().toLowerCase(),
        esp_app_name: $('#filterESPAppName').val().trim().toLowerCase(),
        last_run: $('#filterLastRun').val().trim().toLowerCase(),
        prefix: $('#filterPrefix').val().trim().toLowerCase(),
        type: $('#filterType').val().trim().toLowerCase(),
        remedy_support_group: $('#filterRemedyGroup').val().trim().toLowerCase(),
        snow_support_group: $('#filterSnowGroup').val().trim().toLowerCase(),
        snow_support_group_mgr: $('#filterSnowMgr').val().trim().toLowerCase(),
        support_market: $('#filterMarket').val().trim().toLowerCase(),
        app_name: $('#filterAppName').val().trim().toLowerCase(),
        ldap_group: $('#filterLDAP').val().trim().toLowerCase(),
        env: $('#filterEnv').val().trim().toLowerCase(),
        purpose: $('#filterPurpose').val().trim().toLowerCase(),
        job_owner: $('#filterJobOwner').val().trim().toLowerCase(),
        troux_name: $('#filterTrouxName').val().trim().toLowerCase(),
        troux_id: $('#filterTrouxId').val().trim().toLowerCase(),
        status: $('#filterStatus').val().trim().toLowerCase(),
        impact: $('#filterImpact').val().trim().toLowerCase(),
        complexity: $('#filterComplexity').val().trim().toLowerCase(),
        remarks: $('#filterRemarks').val().trim().toLowerCase(),
        sign_off_name: $('#filterSignOffName').val().trim().toLowerCase(),
        sign_off_date: $('#filterSignOffDate').val().trim().toLowerCase(),
        target_week: $('#filterTargetWeek').val().trim().toLowerCase()
    };

    let visibleRowCount = 0;

    $('#jobTableBody tr').each(function() {
        let row = $(this);
        let showRow = true;

        for (let filter in filters) {
            let columnIndex = getColumnIndex(filter);  // Get the index of the column for this filter
            let cellValue;

            // Special handling for dropdown columns
            if (['status', 'impact', 'complexity'].includes(filter)) {
                cellValue = row.find(`td:eq(${columnIndex}) select option:selected`).text().toLowerCase();
            } else {
                cellValue = row.find('td').eq(columnIndex).text().toLowerCase();
            }

            // If the filter has a value and it does not match, hide the row
            if (filters[filter] && !cellValue.includes(filters[filter])) {
                showRow = false;
                break;
            }
        }

        row.toggle(showRow);  // Show or hide the row based on filter matching
        if (showRow) visibleRowCount++;
    });

    // Update the row count based on the visible rows
    $('#rowCount').text(`Visible Jobs: ${visibleRowCount}`);
}



$('#filterJobName, #filterESPAppName, #filterLastRun, #filterPrefix, #filterType, #filterRemedyGroup, #filterSnowGroup, #filterSnowMgr, #filterMarket, #filterAppName, #filterLDAP, #filterEnv,#filterPurpose, #filterJobOwner, #filterTrouxName, #filterTrouxId, #filterStatus, #filterImpact, #filterComplexity, #filterRemarks, #filterSignOffName, #filterSignOffDate, #filterTargetWeek')
    .on('input change', debounce(applyFilters, 300)); 

   // Modify the sorting event handler to prevent sorting when clicking on filter boxes
$('th').on('click', function(event) {
    // Prevent sorting if the clicked element is an input (filter box)
    if ($(event.target).is('input')) {
        return;  // Exit the handler if an input box was clicked
    }

    const columnIndex = $(this).index(); // Get the index of the clicked column
    const currentSortDirection = $(this).hasClass('asc') ? 'desc' : 'asc'; // Toggle sort direction

    // Remove sorting classes from other headers
    $('th').removeClass('asc desc');

    // Add sorting class to the clicked header
    $(this).addClass(currentSortDirection);

    // Sort the table rows
    const rows = $('#jobTableBody tr').get();
    rows.sort(function(a, b) {
        const aValue = $(a).find('td').eq(columnIndex).text().toUpperCase();
        const bValue = $(b).find('td').eq(columnIndex).text().toUpperCase();

        if (aValue < bValue) {
            return currentSortDirection === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
            return currentSortDirection === 'asc' ? 1 : -1;
        }
        return 0;
    });

    // Re-append the sorted rows to the table body
    $.each(rows, function(index, row) {
        $('#jobTableBody').append(row);
    });

    // Reapply filters after sorting (if any filters are active)
    if ($('#filterJobName').val() || 
        $('#filterESPAppName').val() ||
        $('#filterLastRun').val() ||
        $('#filterPrefix').val() ||
        $('#filterType').val() ||
        $('#filterRemedyGroup').val() ||
        $('#filterSnowGroup').val() ||
        $('#filterSnowMgr').val() ||
        $('#filterMarket').val() ||
        $('#filterAppName').val() ||
        $('#filterLDAP').val() ||
        $('#filterEnv').val() ||
        $('#filterPurpose').val() ||
        $('#filterJobOwner').val() ||
        $('#filterTrouxName').val() ||
        $('#filterTrouxId').val() ||
        $('#filterStatus').val() ||
        $('#filterImpact').val() ||
        $('#filterComplexity').val() ||
        $('#filterRemarks').val() ||
        $('#filterSignOffName').val() ||
        $('#filterSignOffDate').val() ||
        $('#filterTargetWeek').val()) {
        applyFilters();
    }
});

$('#jobTableBody').on('focus', '[contenteditable="true"], select', function() {
    // Capture the original value of the cell on focus
    let originalValue = $(this).is('select') ? $(this).val() : $(this).text().trim();
    $(this).data('original-value', originalValue);  // Store it in a data attribute for later comparison
    console.log(`Debug: Original Value set for Job ID: ${$(this).data('id')}, Column: ${$(this).data('column')}, Value: "${originalValue}"`);
});

$('#jobTableBody').on('blur', '[contenteditable="true"], select', function() {
    const jobId = $(this).data('id');
    const column = $(this).data('column');
    let newValue = $(this).is('select') ? $(this).val() : $(this).text().trim();  // Get the updated value
    const originalValue = $(this).data('original-value');  // Retrieve the original value from the data attribute

    // If the value hasn't changed, do not send the request or show the toast
    if (newValue === originalValue) {
        console.log(`Debug: No change detected. Skipping update for Job ID: ${jobId}, Column: ${column}.`);
        return;  // Exit the handler if no change is detected
    }

    // Format the date to 'YYYY-MM-DD' if it's a date field before sending the update
    if (column === 'sign_off_date') {
        const dateParts = newValue.split('/');
        if (dateParts.length === 3) {
            newValue = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;
        }
    }

    console.log(`Debug: Sending update for Job ID ${jobId}, Column: ${column}, New Value: "${newValue}"`);

    $.ajax({
        url: '/api/single_update',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ job_id: jobId, field: column, value: newValue }),
        success: function(response) {
            console.log(`Debug: Update Response: ${JSON.stringify(response)}`);
            
            // Show toast notification only if there is a true update
            Toastify({
                text: "Update successful!",
                duration: 3000,
                close: true,
                gravity: "top",
                position: "right",
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();

            // Automatically update the sign-off date in the table if the 'sign_off_name' field is changed
            if (column === 'sign_off_name') {
                const todayDate = new Date().toLocaleDateString('en-CA');  // 'en-CA' format: YYYY-MM-DD
                $(`td[data-column="sign_off_date"][data-id="${jobId}"]`).text(todayDate);  // Update the sign-off date cell
            }
        },
        error: function(error) {
            console.log(`Debug: Update Error: ${JSON.stringify(error)}`);
            alert('Error updating job. Please try again.');
        }
    });
});

const massUpdateDropdownOptions = {
    'status': ['Active', 'Inactive'],
    'impact': ['Low', 'Medium', 'High'],
    'complexity': ['Low', 'Medium', 'High']
};

$('#massUpdateField').on('change', function() {
    const selectedField = $(this).val();

    // Check if the selected field requires a dropdown
    if (massUpdateDropdownOptions[selectedField]) {
        // Create a dropdown select element with the corresponding options
        const dropdown = $('<select id="massUpdateValue"></select>');
        massUpdateDropdownOptions[selectedField].forEach(option => {
            dropdown.append(`<option value="${option}">${option}</option>`);
        });
        $('#massUpdateValue').replaceWith(dropdown);  // Replace the input field with the dropdown
    } else {
        // If not a dropdown field, show a regular input box
        const input = $('<input type="text" id="massUpdateValue" placeholder="Enter new value">');
        $('#massUpdateValue').replaceWith(input);  // Replace with a text input
    }
});

let previousValues = [];  // To store the previous state of the selected rows
let undoTimer;  // Timer for the 15-second countdown
const UNDO_TIMEOUT = 15000;  // 15 seconds

$('#massUpdateButton').on('click', function () {
    const field = $('#massUpdateField').val();
    const newValue = $('#massUpdateValue').val();
    const selectedIds = $('.rowCheckbox:checked').map(function () {
        return $(this).data('id');
    }).get();

    if (selectedIds.length === 0) {
        alert('Please select at least one row to update.');
        return;
    }

    // Store previous values for undo
    previousValues = selectedIds.map(jobId => {
        const cell = $(`td[data-column="${field}"][data-id="${jobId}"]`);
        const selectElement = cell.find('select');
        const previousValue = selectElement.length > 0 ? selectElement.val() : cell.text().trim();
        console.log(`Storing previous value for Job ID: ${jobId} - Column: ${field} - Value: ${previousValue}`);
        
        return {
            id: jobId,
            column: field,
            previousValue: previousValue
        };
    });

    console.log("Previous values stored for undo:", previousValues);  // Debugging statement

    // Perform the mass update
    $.ajax({
        url: '/api/mass_update',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ field: field, value: newValue, selected_ids: selectedIds }),
        success: function (response) {
            if (response.success) {
                console.log('Mass update successful!');

                // Apply changes visually on the frontend
                selectedIds.forEach(jobId => {
                    const cell = $(`td[data-column="${field}"][data-id="${jobId}"]`);
                    const selectElement = cell.find('select');
                    if (selectElement.length > 0) {
                        selectElement.val(newValue).change();
                    } else {
                        cell.text(newValue);
                    }
                });

                // Generate a unique ID for the undo button
                const uniqueUndoId = `undoToastButton-${new Date().getTime()}`;

                const toastInstance = Toastify({
                    text: `Mass update successful! <button id="${uniqueUndoId}" style="background:none;border:none;color:#0000EE;text-decoration:underline;cursor:pointer;">Undo</button>`,
                    duration: UNDO_TIMEOUT,
                    close: true,
                    gravity: "top",
                    position: "right",  // Set the position to right
                    escapeMarkup: false,
                    className: "info-with-progress toastify-right",  // Include custom class to force right alignment
                    style: { background: "linear-gradient(to right, #00b09b, #96c93d)" },
                    stopOnFocus: true,
                }).showToast();
                

                // Ensure the button is rendered and attach the event listener
                setTimeout(() => {
                    const undoButton = document.getElementById(uniqueUndoId);
                    if (undoButton) {
                        console.log(`Attaching click listener to #${uniqueUndoId}`);
                        undoButton.addEventListener('click', function () {
                            console.log("Undo button clicked! Triggering undoMassUpdate...");
                            toastInstance.hideToast();  // Clear the mass update notification immediately
                            undoMassUpdate();  // Trigger the undo function
                        });
                    } else {
                        console.error(`Undo button with ID #${uniqueUndoId} not found!`);
                    }
                }, 500);  // Adjust the timeout duration if needed

                // Start the countdown timer for 15 seconds
                undoTimer = setTimeout(() => {
                    console.log('Undo period expired. Reloading data...');
                    // Reload the filtered data after timeout
                    const selectedCompany = $('#companySelect').val();
                    $('#jobTableBody').empty();  // Clear existing rows
                    loadJobs(1, selectedCompany);  // Reload filtered data
                }, UNDO_TIMEOUT);
            } else {
                alert('Mass update failed. Please check the server logs.');
            }
        },
        error: function (error) {
            alert('Error during mass update. Please try again.');
        }
    });
});




function undoMassUpdate() {
    console.log("Undo function triggered successfully!");  // Verify if the function is called
    console.log("Current previousValues:", previousValues);  // Debugging statement

    if (previousValues.length === 0) {
        console.log("No previous values found. Exiting undo function.");
        return;
    }

    // Perform the undo operation
    $.ajax({
        url: '/api/undo_mass_update',
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ previous_values: previousValues }),
        success: function (response) {
            if (response.success) {
                // Revert values in the frontend
                previousValues.forEach(({ id, column, previousValue }) => {
                    const cell = $(`td[data-column="${column}"][data-id="${id}"]`);
                    const selectElement = cell.find('select');

                    if (selectElement.length > 0) {
                        selectElement.val(previousValue).change();
                    } else {
                        cell.text(previousValue);
                    }
                });

                console.log("Undo operation successful. Clearing previousValues...");
                previousValues = [];  // Clear the stored state after successful undo
                clearTimeout(undoTimer);

                // Show success notification
                Toastify({
                    text: "Undo successful!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    style: { background: "#dc3545" },
                }).showToast();
            } else {
                alert('Undo failed. Please check the server logs.');
            }
        },
        error: function (error) {
            alert('Error during undo. Please try again.');
        }
    });
}




// Select All Functionality
$('#selectAll').on('change', function() {
    // Select only checkboxes in visible rows
    const isChecked = $(this).is(':checked');
    $('#jobTableBody tr:visible .rowCheckbox').prop('checked', isChecked);
    toggleHighlight(); // Highlight/unhighlight rows based on checkbox state
});

// Individual checkbox change listener for visible rows
$('#jobTableBody').on('change', '.rowCheckbox', function() {
    toggleHighlight(); // Highlight/unhighlight the row

    // Update the "Select All" checkbox based on visible rows
    const totalVisible = $('#jobTableBody tr:visible .rowCheckbox').length;
    const totalChecked = $('#jobTableBody tr:visible .rowCheckbox:checked').length;
    $('#selectAll').prop('checked', totalVisible === totalChecked);
});

// Function to toggle highlight class on rows based on checkbox state
function toggleHighlight() {
    $('#jobTableBody tr:visible .rowCheckbox').each(function() {
        const row = $(this).closest('tr');
        if ($(this).is(':checked')) {
            row.addClass('highlight');
        } else {
            row.removeClass('highlight');
        }
    });
}

    // Function to toggle highlight class on rows based on checkbox state
    function toggleHighlight() {
        $('.rowCheckbox').each(function() {
            const row = $(this).closest('tr');
            if ($(this).is(':checked')) {
                row.addClass('highlight');
            } else {
                row.removeClass('highlight');
            }
        });
    }

});

$(document).ready(function() {
    let sortDirection = 'asc';  // Default sort direction
    let sortColumn = '';

    function sortTable(column) {
        const columnIndex = getColumnIndex(column);  // Get the column index using the `getColumnIndex` function
        const rows = $('#jobTableBody tr').get();
        rows.sort(function(a, b) {
            let aValue, bValue;
    
            // Check if the current column is one of the dropdown columns
            if (['status', 'impact', 'complexity'].includes(column)) {
                // If it's a dropdown, get the selected text value for comparison
                aValue = $(a).find(`td:eq(${columnIndex}) select option:selected`).text().toLowerCase().trim();
                bValue = $(b).find(`td:eq(${columnIndex}) select option:selected`).text().toLowerCase().trim();
            } else {
                // Regular columns, get the text value directly
                aValue = $(a).find(`td:eq(${columnIndex})`).text().toLowerCase().trim();
                bValue = $(b).find(`td:eq(${columnIndex})`).text().toLowerCase().trim();
            }
    
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    
        $.each(rows, function(index, row) {
            $('#jobTableBody').append(row);
        });
    
        // Toggle sort direction
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    
    
    
    
    $('th').on('click', function(e) {
        if ($(e.target).is('input')) return;  // Ignore clicks on filter input boxes
    
        const column = $(this).data('column');  // Use the data attribute to get the column name
        if (!column) return;
    
        // Remove sort classes from all headers
        $('th').removeClass('sorted sort-asc sort-desc');
    
        // Set the current column and direction
        if (sortColumn !== column) {
            sortDirection = 'asc';  // Reset to ascending if a new column is clicked
        }
        sortColumn = column;
    
        // Sort the table using the updated function
        sortTable(column);
    
        // Add the appropriate class to show the sorting direction
        $(this).addClass(`sorted sort-${sortDirection}`);
    });
    
    
    
});

$(document).ready(function() {
    // Add click event listener to the download button
    $('#downloadCsvButton').on('click', function() {
        const visibleRows = $('#jobTableBody tr:visible');  // Get only the visible rows
        if (visibleRows.length === 0) {
            alert('No visible rows to download!');
            return;
        }

        // Create a CSV string from the visible rows
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Get the column headers
        const headers = [];
        $('th').each(function() {
            const headerText = $(this).contents().filter(function() {
                return this.nodeType === Node.TEXT_NODE;  // Get only the text node
            }).text().trim();
            if (headerText) headers.push(headerText);  // Skip empty headers
        });
        
        csvContent += headers.join(",") + "\n";  // Add header row to CSV

        // Iterate through each visible row and get cell data
        visibleRows.each(function() {
            const rowData = [];
            $(this).find('td').each(function() {
                // Collect text content of each cell
                rowData.push('"' + $(this).text().trim() + '"');  // Wrap each cell value in quotes for CSV formatting
            });
            csvContent += rowData.join(",") + "\n";  // Add row data to CSV
        });

        // Create a download link and trigger it
        const encodedUri = encodeURI(csvContent);
        const downloadLink = document.createElement("a");
        downloadLink.setAttribute("href", encodedUri);
        downloadLink.setAttribute("download", "visible_rows.csv");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);  // Clean up the link element after download
    });
});




