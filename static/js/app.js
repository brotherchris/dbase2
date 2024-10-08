$(document).ready(function() {
  let currentPage = 1; 
  let totalCount = 0;  
  let loading = false; 
  let hasTotalCountDisplayed = false; 

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
            <td>${job.status}</td> 
            <td>${job.impact}</td> 
            <td>${job.complexity}</td> 
            <td contenteditable="true" data-column="remarks" data-id="${job.id}">${job.remarks}</td>
            <td contenteditable="true" data-column="sign_off_name" data-id="${job.id}">${job.sign_off_name}</td>
            <td>${job.sign_off_date}</td>
            <td contenteditable="true" data-column="target_week" data-id="${job.id}">${job.target_week}</td>
        </tr>
                  </tr>
              `;
              tableBody.append(row);
          });

          currentPage += 1; 
          loading = false; 
      });
  }

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
        jobName: $('#filterJobName').val().trim().toLowerCase(),
        espAppName: $('#filterESPAppName').val().trim().toLowerCase(),
        lastRunDate: $('#filterLastRun').val().trim().toLowerCase(),
        prefix: $('#filterPrefix').val().trim().toLowerCase(),
        type: $('#filterType').val().trim().toLowerCase(),
        remedyGroup: $('#filterRemedyGroup').val().trim().toLowerCase(),
        snowGroup: $('#filterSnowGroup').val().trim().toLowerCase(),
        snowMgr: $('#filterSnowMgr').val().trim().toLowerCase(),
        market: $('#filterMarket').val().trim().toLowerCase(),
        appName: $('#filterAppName').val().trim().toLowerCase(),
        ldap: $('#filterLDAP').val().trim().toLowerCase(),
        env: $('#filterEnv').val().trim().toLowerCase(),
        purpose: $('#filterPurpose').val().trim().toLowerCase(),
        jobOwner: $('#filterJobOwner').val().trim().toLowerCase(),
        trouxName: $('#filterTrouxName').val().trim().toLowerCase(),
        trouxId: $('#filterTrouxId').val().trim().toLowerCase(),
        status: $('#filterStatus').val().trim().toLowerCase(),
        impact: $('#filterImpact').val().trim().toLowerCase(),
        complexity: $('#filterComplexity').val().trim().toLowerCase(),
        remarks: $('#filterRemarks').val().trim().toLowerCase(),
        signOffName: $('#filterSignOffName').val().trim().toLowerCase(),
        signOffDate: $('#filterSignOffDate').val().trim().toLowerCase(),
        targetWeek: $('#filterTargetWeek').val().trim().toLowerCase()
    };

    let visibleRowCount = 0;  // Initialize a counter for visible rows

    $('#jobTableBody tr').each(function() {
        let row = $(this);
        let showRow = true;

        for (let filter in filters) {
            if (filters[filter] && !row.find('td:eq(' + getColumnIndex(filter) + ')').text().toLowerCase().includes(filters[filter])) {
                showRow = false;
                break;
            }
        }

        row.toggle(showRow);  // Show or hide the row based on filter matching

        if (showRow) {
            visibleRowCount++;  // Increment the counter if the row is visible
        }
    });

    // Update the row count based on the visible rows
    $('#rowCount').text(`Visible Jobs: ${visibleRowCount}`);
}


function getColumnIndex(filterName) {
  const columnMap = {
      jobName: 1,
      espAppName: 2,
      lastRunDate: 3,
      prefix: 4,
      type: 5,
      remedyGroup: 6,
      snowGroup: 7,
      snowMgr: 8,
      market: 9,
      appName: 10,
      ldap: 11,
      env: 12,
      purpose: 13,
      jobOwner: 14,
      trouxName: 15,
      trouxId: 16,
      status: 17,
      impact: 18,
      complexity: 19,
      remarks: 20,
      signOffName: 21,
      signOffDate: 22,
      targetWeek: 23
  };
  return columnMap[filterName] || -1; // Return -1 if filterName is not found
}

$('#filterJobName, #filterESPAppName, #filterLastRun, #filterPrefix, #filterType, #filterRemedyGroup, #filterSnowGroup, #filterSnowMgr, #filterMarket, #filterAppName, #filterLDAP, #filterEnv,#filterPurpose, #filterJobOwner, #filterTrouxName, #filterTrouxId, #filterStatus, #filterImpact, #filterComplexity, #filterRemarks, #filterSignOffName, #filterSignOffDate, #filterTargetWeek')
    .on('input', debounce(applyFilters, 300)); 

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

    $('#jobTableBody').on('blur', '[contenteditable="true"], select', function() {
        const jobId = $(this).data('id');
        const column = $(this).data('column');
        let newValue = $(this).is('select') ? $(this).val() : $(this).text().trim();
    
        // Format the date to 'YYYY-MM-DD' if it's a date field
        if (column === 'sign_off_date') {
            const dateParts = newValue.split('/');
            if (dateParts.length === 3) {
                newValue = `${dateParts[2]}-${dateParts[0].padStart(2, '0')}-${dateParts[1].padStart(2, '0')}`;  // Convert to 'YYYY-MM-DD'
            }
        }
    
        console.log(`Debug: Updating job ID: ${jobId}, Column: ${column}, New Value: ${newValue}`);
    
        $.ajax({
            url: '/api/single_update',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ job_id: jobId, field: column, value: newValue }),
            success: function(response) {
                console.log(`Debug: Update Response: ${JSON.stringify(response)}`);
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
    


    // Mass Update Functionality
    $('#massUpdateButton').on('click', function() {
        const field = $('#massUpdateField').val();
        const newValue = $('#massUpdateValue').val();
        const selectedIds = $('.rowCheckbox:checked').map(function() {
            return $(this).data('id');
        }).get();

        // Store original values before the update
        const originalData = [];
        selectedIds.forEach(jobId => {
            const cell = $(`td[data-column="${field}"][data-id="${jobId}"]`);
            const originalValue = cell.is('select') ? cell.find('option:selected').text() : cell.text();
            originalData.push({ job_id: jobId, field: field, original_value: originalValue });
        });

        if (selectedIds.length === 0) {
            alert('Please select at least one row to update.');
            return;
        }


        $.ajax({
            url: '/api/mass_update',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ field: field, value: newValue, selected_ids: selectedIds }),
            success: function(response) {
                Toastify({
                    text: "Mass update successful!",
                    duration: 3000,
                    close: true,
                    gravity: "top",
                    position: "right",
                    stopOnFocus: true,
                    style: {
                        background: "linear-gradient(to right, #00b09b, #96c93d)",
                    },
                    onClick: function() {}
                }).showToast();

                // Update the table with the new values
                selectedIds.forEach(jobId => {
                    const cell = $(`td[data-column="${field}"][data-id="${jobId}"]`);
                    if (cell.is('select')) {
                        cell.val(newValue);
                    } else {
                        cell.text(newValue);
                    }

                    // Update sign-off date if sign-off name was changed
                    if (field === 'sign_off_name') {
                        $(`td[data-column="sign_off_date"][data-id="${jobId}"]`).text(new Date().toLocaleDateString());
                    }
                });
            },
            error: function(error) {
                console.error('Error during mass update:', error);
                alert('Error during mass update. Please try again.');

                // Revert the changes in case of an error
                $.ajax({
                    url: '/api/undo_mass_update',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(originalData),
                    error: function(undoError) {
                        console.error('Error undoing mass update:', undoError);
                        alert('An error occurred while trying to undo the changes. Please refresh the page.');
                    }
                });
            }
        });
    });

    // Select All Functionality
    $('#selectAll').on('change', function() {
        $('.rowCheckbox').prop('checked', this.checked);
        toggleHighlight(); // Highlight/unhighlight rows based on checkbox state
    });

    // Individual checkbox change listener
    $('#jobTableBody').on('change', '.rowCheckbox', function() {
        toggleHighlight(); // Highlight/unhighlight the row
        // Check if all checkboxes are checked and update the "Select All" checkbox accordingly
        $('#selectAll').prop('checked', $('.rowCheckbox').length === $('.rowCheckbox:checked').length);
    });

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
    let sortDirection = 'asc';
    let sortColumn = '';

    function sortTable(column) {
        const rows = $('#jobTableBody tr').get();
        rows.sort(function(a, b) {
            const aValue = $(a).find(`td[data-column="${column}"]`).text().toLowerCase();
            const bValue = $(b).find(`td[data-column="${column}"]`).text().toLowerCase();

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

        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }

    $('th').on('click', function(e) {
        if ($(e.target).is('input')) return;  // Ignore clicks on filter input boxes

        const column = $(this).data('column');
        if (!column) return;

        // Remove sort classes from all headers
        $('th').removeClass('sorted sort-asc sort-desc');

        // Set the current column and direction
        if (sortColumn !== column) {
            sortDirection = 'asc';  // Reset to ascending if a new column is clicked
        }
        sortColumn = column;

        // Sort the table
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
$(document).ready(function() {
    // Event listener for single cell updates
    $('#jobTableBody').on('blur', '[contenteditable="true"]', function() {
        const jobId = $(this).data('id');
        const column = $(this).data('column');
        const newValue = $(this).text().trim();

        // Send an AJAX request to update the database
        $.ajax({
            url: '/api/single_update',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ job_id: jobId, field: column, value: newValue }),
            success: function(response) {
                console.log("Update successful for job:", jobId);
                
                // Automatically update the sign-off date if the 'sign_off_name' field is changed
                if (column === 'sign_off_name') {
                    const todayDate = new Date().toLocaleDateString();  // Get today's date in local format
                    $(`td[data-column="sign_off_date"][data-id="${jobId}"]`).text(todayDate);

                    // Optionally send an additional request to update the sign-off date in the database
                    $.ajax({
                        url: '/api/single_update',
                        method: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify({ job_id: jobId, field: 'sign_off_date', value: todayDate }),
                        success: function(response) {
                            console.log("Sign-off date updated for job:", jobId);
                        },
                        error: function(error) {
                            console.error('Error updating sign-off date:', error);
                        }
                    });
                }
            },
            error: function(error) {
                console.error('Error updating job:', error);
                alert('Error updating job. Please try again.');
            }
        });
    });
});

