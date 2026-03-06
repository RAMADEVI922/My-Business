import re

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\AdminDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Remove props that are now local state
props_to_remove = [
    'showRescheduleModal,',
    'setShowRescheduleModal,',
    'rescheduleOrder,',
    'setRescheduleOrder,',
    'proposedDate,',
    'setProposedDate,',
    'rescheduleReason,',
    'setRescheduleReason,',
    'newProduct,',
    'setNewProduct,',
    'handleProductInputChange,',
    'handleAddProduct,',
    'productPhotoPreview,',
    'setProductPhotoPreview,',
    'productPhotoFile,',
    'setProductPhotoFile,',
    'isUploadingProduct,',
    'handleDeleteProduct,'
]
for p in props_to_remove:
    code = code.replace(f"    {p}\n", "")

# Add local state and handler logic right after `const navigate = useNavigate();`
local_state_and_handlers = """
    const [showRescheduleModal, setShowRescheduleModal] = React.useState(false);
    const [rescheduleOrder, setRescheduleOrder] = React.useState(null);
    const [proposedDate, setProposedDate] = React.useState('');
    const [rescheduleReason, setRescheduleReason] = React.useState('');
    const [newProduct, setNewProduct] = React.useState({ name: '', price: '', photo: '' });
    const [productPhotoFile, setProductPhotoFile] = React.useState(null);
    const [productPhotoPreview, setProductPhotoPreview] = React.useState('');
    const [isUploadingProduct, setIsUploadingProduct] = React.useState(false);

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct(prev => ({ ...prev, [name]: value }));
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (newProduct.name && newProduct.price) {
            setIsUploadingProduct(true);
            const id = `P${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            let photoUrl = '';
            if (productPhotoFile) {
                // Must import uploadToS3
                const { uploadToS3 } = await import('../aws-config.js');
                photoUrl = await uploadToS3(productPhotoFile, 'product-images');
            }
            const productToAdd = { ...newProduct, id, photo: photoUrl || '' };
            const { saveProduct } = await import('../aws-config.js');
            const success = await saveProduct(productToAdd);
            if (success) {
                // Not ideal to append here if using useProducts hook, but for now we'll trigger a re-fetch or assume products auto poll
                alert('Product added successfully. Refresh the page to see changes.');
                setNewProduct({ name: '', price: '', photo: '' });
                setProductPhotoFile(null);
                setProductPhotoPreview('');
            }
            setIsUploadingProduct(false);
        }
    };

    const handleDeleteProduct = async (id) => {
        if(window.confirm('Delete this product?')) {
            const { removeProduct } = await import('../aws-config.js');
            await removeProduct(id);
            alert('Product deleted successfully. Refresh the page to see changes.');
        }
    };
"""

code = code.replace("    const navigate = useNavigate();", "    const navigate = useNavigate();\n" + local_state_and_handlers)

with open(r'c:\Users\hp\Desktop\project\adminpage\src\components\AdminDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print("AdminDashboard refactored.")
