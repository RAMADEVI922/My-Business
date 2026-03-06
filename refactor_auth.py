import re

# ------------- ForgotPassword.jsx -------------
with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\ForgotPassword.jsx', 'r', encoding='utf-8') as f:
    forgot_code = f.read()

props_to_remove = [
    'forgotStage,', 'setForgotStage,', 'resetEmail,', 'setResetEmail,',
    'handleSendOTP,', 'error,', 'resetLoading,', 'handleVerifyAndReset,',
    'resetOTP,', 'setResetOTP,', 'newPassword,', 'setNewPassword,',
    'confirmNewPassword,', 'setConfirmNewPassword,', 'showPassword,',
    'setShowPassword,', 'showConfirmPassword,', 'setShowConfirmPassword,'
]

for p in props_to_remove:
    forgot_code = forgot_code.replace(f"    {p}\n", "")
    
# We need to add local states and imports for aws-config functions
forgot_local_state = """
    const [forgotStage, setForgotStage] = React.useState('email');
    const [resetEmail, setResetEmail] = React.useState('');
    const [resetOTP, setResetOTP] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmNewPassword, setConfirmNewPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [error, setError] = React.useState('');
    const [resetLoading, setResetLoading] = React.useState(false);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setResetLoading(true);
        try {
            const { getAdminByEmail, saveOTP, sendPasswordResetEmail } = await import('../aws-config.js');
            const admin = await getAdminByEmail(resetEmail);
            if (!admin) {
                setError('Email not found. Please enter your registered admin email.');
                setResetLoading(false);
                return;
            }
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            const saved = await saveOTP(admin.username, otp);
            if (!saved) {
                setError('Failed to generate reset token. Please try again.');
                setResetLoading(false);
                return;
            }
            const sent = await sendPasswordResetEmail(resetEmail, otp);
            if (!sent) {
                setError('Failed to send reset email. Ensure your SES is configured.');
                setResetLoading(false);
                return;
            }
            setForgotStage('otp');
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };

    const handleVerifyAndReset = async (e) => {
        e.preventDefault();
        setError('');
        if (newPassword !== confirmNewPassword) {
            setError('Passwords do not match.'); return;
        }
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.'); return;
        }
        setResetLoading(true);
        try {
            const { verifyOTP, getAdminByEmail, updateAdminPassword } = await import('../aws-config.js');
            const verification = await verifyOTP(resetEmail, resetOTP);
            if (!verification.success) {
                setError(verification.message || 'Invalid or expired OTP.');
                setResetLoading(false); return;
            }
            const admin = await getAdminByEmail(resetEmail);
            const updated = await updateAdminPassword(admin.username, newPassword);
            if (!updated) {
                setError('Failed to update password. Please try again.');
                setResetLoading(false); return;
            }
            setForgotStage('success');
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setResetLoading(false);
        }
    };
"""

forgot_code = forgot_code.replace("    return (", forgot_local_state + "\n    return (")

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\ForgotPassword.jsx', 'w', encoding='utf-8') as f:
    f.write(forgot_code)


# ------------- AdminLogin.jsx -------------
with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\AdminLogin.jsx', 'r', encoding='utf-8') as f:
    admin_code = f.read()

props_to_remove = ['error,', 'handleInputChange,', 'showPassword,', 'setShowPassword,']
for p in props_to_remove:
    admin_code = admin_code.replace(f"    {p}\n", "")

# The handler will be passed from App but requires local formData
admin_local = """
    const [formData, setFormData] = React.useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleAdminLogin(e, formData);
"""
admin_code = admin_code.replace("    return (", admin_local + "\n    return (")
admin_code = admin_code.replace("onSubmit={handleAdminLogin}", "onSubmit={onSubmit}")

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\AdminLogin.jsx', 'w', encoding='utf-8') as f:
    f.write(admin_code)

# ------------- CustomerLogin.jsx -------------
with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\CustomerLogin.jsx', 'r', encoding='utf-8') as f:
    clogin_code = f.read()

props_to_remove = ['error,', 'formData,', 'handleInputChange,', 'showPassword,', 'setShowPassword,']
for p in props_to_remove:
    clogin_code = clogin_code.replace(f"    {p}\n", "")

clogin_local = """
    const [formData, setFormData] = React.useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleCustomerLogin(e, formData);
"""
clogin_code = clogin_code.replace("    return (", clogin_local + "\n    return (")
clogin_code = clogin_code.replace("onSubmit={handleCustomerLogin}", "onSubmit={onSubmit}")

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\CustomerLogin.jsx', 'w', encoding='utf-8') as f:
    f.write(clogin_code)

# ------------- CustomerRegister.jsx -------------
with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\CustomerRegister.jsx', 'r', encoding='utf-8') as f:
    creg_code = f.read()

props_to_remove = [
    'formData,', 'handleInputChange,', 'showPassword,', 'setShowPassword,',
    'showConfirmPassword,', 'setShowConfirmPassword,', 'selectedFiles,', 'setSelectedFiles,'
]
for p in props_to_remove:
    creg_code = creg_code.replace(f"    {p}\n", "")

creg_local = """
    const [formData, setFormData] = React.useState({
        email: '', phone: '', address: '', password: '', confirmPassword: '',
        firstName: '', lastName: '', shopPicture: '', idType: 'pancard', idProof: ''
    });
    const [selectedFiles, setSelectedFiles] = React.useState({ shopPicture: null, idProof: null });
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmit = (e) => handleCustomerRegister(e, formData, selectedFiles, customerType);
"""
creg_code = creg_code.replace("    return (", creg_local + "\n    return (")
creg_code = creg_code.replace("onSubmit={handleCustomerRegister}", "onSubmit={onSubmit}")

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\CustomerRegister.jsx', 'w', encoding='utf-8') as f:
    f.write(creg_code)

print("Auth components refactored.")
