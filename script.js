document.addEventListener('DOMContentLoaded', () => {
    const accessKeyInput = document.getElementById('access-key');
    const secretKeyInput = document.getElementById('secret-key');
    const regionInput = document.getElementById('region');
    const submitBtn = document.getElementById('submit-btn');
    const resultsDiv = document.getElementById('results');
    const resultsTable = document.createElement('table'); 
    resultsTable.classList.add('table');

    // Add a click event listener to the "Fetch EC2 Instances" button
    submitBtn.addEventListener('click', async () => {

        // Get user input values for access key, secret key, and region
        const accessKey = accessKeyInput.value;
        const secretKey = secretKeyInput.value;
        const region = regionInput.value;

        // Create AWS credentials object
        const credentials = new AWS.Credentials(accessKey, secretKey);

        // Create an AWS EC2 client with the specified region and credentials
        const ec2 = new AWS.EC2({
            region,
            credentials
        });

        // Clear input fields
        accessKeyInput.value = '';
        secretKeyInput.value = '';
        regionInput.value = '';

        try {
            // Fetch EC2 instance data
            const data = await ec2.describeInstances({}).promise();

            // Map and format the EC2 instance data
            const instances = data.Reservations.map(reservation => {
                const instance = reservation.Instances[0];
                const osType = instance.Platform || 'Linux/Unix';
                return `
                    <tr>
                        <td>${instance.InstanceId}</td>
                        <td>${instance.InstanceType}</td>
                        <td>${instance.State.Name}</td>
                        <td>${instance.PublicIpAddress || 'N/A'}</td>
                        <td>${instance.PrivateIpAddress || 'N/A'}</td>
                        <td>${instance.LaunchTime || 'N/A'}</td>
                        <td>${osType}</td>
                    </tr>
                `;
            }).join('');

            // Create the table header
            const tableHeader = `
                <thead>
                    <tr>
                        <th>Instance ID</th>
                        <th>Instance Type</th>
                        <th>Instance State</th>
                        <th>Public IP Address</th>
                        <th>Private IP Address</th>
                        <th>Launch Time</th>
                        <th>Operating System</th>
                    </tr>
                </thead>
            `;

            // Display the table with instance data in the resultsDiv
            resultsTable.innerHTML = tableHeader + instances;
            resultsDiv.innerHTML = ''; 
            resultsDiv.appendChild(resultsTable);
            resultsDiv.classList.remove('hidden');
        } catch (error) {
            console.error('Error:', error);
            resultsDiv.innerHTML = `<p>Error retrieving EC2 instances in ${region} region.</p>`;
            resultsDiv.classList.remove('hidden');
        }
    });
});
