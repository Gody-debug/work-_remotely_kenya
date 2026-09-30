 // WorkRemote Kenya - Frontend Logic - Fixed
const API_URL = 'https://online-work-platform.onrender.com';

document.addEventListener('DOMContentLoaded', ()=>{
  // Handle Payment Form if exists
  const paymentForm = document.getElementById('paymentForm');
  if(paymentForm){
    paymentForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const phone = document.getElementById('phone').value.trim();
      const amount = document.getElementById('amount').value || 350;
      const statusEl = document.getElementById('paymentStatus');
      if(statusEl) statusEl.innerText = 'Sending STK push to '+phone+'...';
      
      try{
        const res = await fetch(`${API_URL}/api/stkpush`, {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({phone, amount})
        });
        const data = await res.json();
        if(statusEl) statusEl.innerText = data.message || 'Check your phone for M-Pesa prompt';
        // After successful push, mark user as paid in backend
        if(data.success || data.ResponseCode === "0"){
          await fetch(`${API_URL}/api/mark-paid`,{
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({phone})
          });
          localStorage.setItem('workremote_paid','yes');
        }
      }catch(err){
        if(statusEl) statusEl.innerText = 'Server waking up... try again in 30 seconds';
        console.error(err);
      }
    });
  }
});

// Save user permanently to backend
async function saveUserToBackend(userData){
  try{
    await fetch(`${API_URL}/api/register`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify(userData)
    });
  }catch(e){ console.log('Backend save failed, saved locally only'); }
}

// Login from backend (so user never loses account)
async function loginFromBackend(phone, password){
  try{
    let res = await fetch(`${API_URL}/api/login`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({phone, password})
    });
    let d = await res.json();
    return d;
  }catch(e){ return {error:'server down'}; }
}
