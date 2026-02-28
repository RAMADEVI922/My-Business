import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

export default function SearchBar({ searchQuery, onSearchChange, resultsCount }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="search-bar-container"
            style={{
                marginBottom: '2rem',
                maxWidth: '600px',
                margin: '0 auto 2rem'
            }}
        >
            <div style={{ position: 'relative', width: '100%' }}>
                <Search 
                    size={20} 
                    style={{
                        position: 'absolute',
                        left: '1rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#c27835',
                        pointerEvents: 'none'
                    }}
                />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="search-input"
                    style={{
                        width: '100%',
                        padding: '1rem 1rem 1rem 3rem',
                        fontSize: '1rem',
                        border: '2px solid rgba(194, 120, 53, 0.3)',
                        borderRadius: '50px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        style={{
                            position: 'absolute',
                            right: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'rgba(194, 120, 53, 0.2)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: '#c27835',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#c27835';
                            e.currentTarget.style.color = 'white';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(194, 120, 53, 0.2)';
                            e.currentTarget.style.color = '#c27835';
                        }}
                    >
                        ×
                    </button>
                )}
            </div>
            {searchQuery && (
                <p style={{
                    marginTop: '0.75rem',
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    textAlign: 'center'
                }}>
                    {resultsCount} product{resultsCount !== 1 ? 's' : ''} found
                </p>
            )}
        </motion.div>
    );
}
