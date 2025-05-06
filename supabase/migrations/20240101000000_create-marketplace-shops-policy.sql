-- Create RLS policies for marketplace_shops table

-- Enable RLS on the table
ALTER TABLE marketplace_shops ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting shops
CREATE POLICY "Users can create their own shops" 
ON marketplace_shops 
FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

-- Create policy for selecting shops
CREATE POLICY "Anyone can view active shops" 
ON marketplace_shops 
FOR SELECT 
USING (status = 'active');

-- Create policy for updating shops
CREATE POLICY "Users can update their own shops" 
ON marketplace_shops 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- Create policy for deleting shops
CREATE POLICY "Users can delete their own shops" 
ON marketplace_shops 
FOR DELETE 
USING (auth.uid() = owner_id);
