const apiKey = import.meta.env.AIRTABLE_PAT;
const baseId = import.meta.env.AIRTABLE_BASE_ID;

export async function registerUser(nombre, email, edad) {
    const tableName = import.meta.env.AIRTABLE_TABLE_NAME || 'Usuarios';
    if (!apiKey || !baseId) {
        throw new Error('Airtable credentials are not configured.');
    }

    const payload = {
        records: [
            {
                fields: {
                    "Name": nombre,
                    "Email": email,
                    "Age": parseInt(edad) || null
                }
            }
        ]
    };

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error communicating with Airtable.');
    }

    return true;
}

export async function getResidents() {
    if (!apiKey || !baseId) {
        throw new Error('Airtable credentials are not configured.');
    }
    const tableName = 'residents';
    
    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error fetching residents from Airtable.');
    }

    const data = await response.json();
    return data.records.map((r) => {
        const keys = Object.keys(r.fields);
        const roomKey = keys.find(k => k.toLowerCase() === 'room');
        const nameKey = keys.find(k => k.toLowerCase() === 'name');
        const checkoutKey = keys.find(k => k.toLowerCase() === 'checkout');
        
        return {
            id: r.id,
            room: roomKey ? r.fields[roomKey] : '',
            name: nameKey ? r.fields[nameKey] : '',
            hasCheckedOut: checkoutKey ? !!r.fields[checkoutKey] : false
        };
    }).filter((r) => r.room);
}

export async function updateResidentCheckout(recordId, isCheckout) {
    if (!apiKey || !baseId) {
        throw new Error('Airtable credentials are not configured.');
    }
    
    if (!recordId) throw new Error('Resident ID not found.');

    const tableName = 'residents';

    const payload = {
        fields: {
            "checkout": isCheckout
        }
    };

    const response = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${recordId}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || 'Error updating status in Airtable.');
    }

    return true;
}
