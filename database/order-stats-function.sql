-- Function to get order statistics
CREATE OR REPLACE FUNCTION get_order_stats()
RETURNS JSON AS $$
DECLARE
    total_count INTEGER;
    pending_count INTEGER;
    success_count INTEGER;
    failed_count INTEGER;
    total_revenue NUMERIC;
BEGIN
    -- Get total count
    SELECT COUNT(*) INTO total_count FROM orders;
    
    -- Get pending count
    SELECT COUNT(*) INTO pending_count FROM orders WHERE status = 'pending';
    
    -- Get success count
    SELECT COUNT(*) INTO success_count FROM orders WHERE status = 'success';
    
    -- Get failed count
    SELECT COUNT(*) INTO failed_count FROM orders WHERE status = 'failed';
    
    -- Get total revenue from successful orders
    SELECT COALESCE(SUM(amount), 0) INTO total_revenue FROM orders WHERE status = 'success';
    
    -- Return as JSON
    RETURN json_build_object(
        'total', total_count,
        'pending', pending_count,
        'success', success_count,
        'failed', failed_count,
        'total_revenue', total_revenue
    );
END;
$$ LANGUAGE plpgsql;

