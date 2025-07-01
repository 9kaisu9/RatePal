import { supabase } from '../lib/supabase';
import { Tables } from '../lib/supabase';

// User Services
export const userService = {
  // Create a new user
  async createUser(email: string, password: string, name?: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign in a user
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  },
  
  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  
  // Get current user
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },
  
  // Get user profile
  async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) throw error;
    return data;
  },
};

// List Services
export const listService = {
  // Get all lists for the current user
  async getLists() {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    return data as Tables['lists'][];
  },
  
  // Get a specific list by ID
  async getListById(id: string) {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Tables['lists'];
  },
  
  // Create a new list
  async createList(list: Omit<Tables['lists'], 'id' | 'created_at' | 'updated_at' | 'last_entry_at' | 'entry_count'>) {
    const { data, error } = await supabase
      .from('lists')
      .insert(list)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['lists'];
  },
  
  // Update a list
  async updateList(id: string, updates: Partial<Tables['lists']>) {
    const { data, error } = await supabase
      .from('lists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['lists'];
  },
  
  // Delete a list
  async deleteList(id: string) {
    const { error } = await supabase
      .from('lists')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
};

// Custom Field Services
export const customFieldService = {
  // Get custom fields for a list
  async getCustomFieldsByListId(listId: string) {
    const { data, error } = await supabase
      .from('custom_fields')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true });
      
    if (error) throw error;
    return data as Tables['custom_fields'][];
  },
  
  // Create a custom field
  async createCustomField(field: Omit<Tables['custom_fields'], 'id'>) {
    const { data, error } = await supabase
      .from('custom_fields')
      .insert(field)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['custom_fields'];
  },
  
  // Update a custom field
  async updateCustomField(id: string, updates: Partial<Tables['custom_fields']>) {
    const { data, error } = await supabase
      .from('custom_fields')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['custom_fields'];
  },
  
  // Delete a custom field
  async deleteCustomField(id: string) {
    const { error } = await supabase
      .from('custom_fields')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
};

// Entry Services
export const entryService = {
  // Get entries for a list
  async getEntriesByListId(listId: string) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('list_id', listId)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data as Tables['entries'][];
  },
  
  // Get a specific entry
  async getEntryById(id: string) {
    const { data, error } = await supabase
      .from('entries')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Tables['entries'];
  },
  
  // Create a new entry
  async createEntry(entry: Omit<Tables['entries'], 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('entries')
      .insert(entry)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['entries'];
  },
  
  // Update an entry
  async updateEntry(id: string, updates: Partial<Tables['entries']>) {
    const { data, error } = await supabase
      .from('entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['entries'];
  },
  
  // Delete an entry
  async deleteEntry(id: string) {
    const { error } = await supabase
      .from('entries')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
};

// Field Value Services
export const fieldValueService = {
  // Get field values for an entry
  async getFieldValuesByEntryId(entryId: string) {
    const { data, error } = await supabase
      .from('field_values')
      .select('*')
      .eq('entry_id', entryId);
      
    if (error) throw error;
    return data as Tables['field_values'][];
  },
  
  // Get field values for multiple entries
  async getFieldValuesByEntryIds(entryIds: string[]) {
    const { data, error } = await supabase
      .from('field_values')
      .select('*')
      .in('entry_id', entryIds);
      
    if (error) throw error;
    return data as Tables['field_values'][];
  },
  
  // Create a field value
  async createFieldValue(fieldValue: Omit<Tables['field_values'], 'id'>) {
    const { data, error } = await supabase
      .from('field_values')
      .insert(fieldValue)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['field_values'];
  },
  
  // Update a field value
  async updateFieldValue(id: string, updates: Partial<Tables['field_values']>) {
    const { data, error } = await supabase
      .from('field_values')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['field_values'];
  },
  
  // Delete a field value
  async deleteFieldValue(id: string) {
    const { error } = await supabase
      .from('field_values')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
  },
};

// Rating System Services
export const ratingSystemService = {
  // Get all rating systems
  async getRatingSystems() {
    const { data, error } = await supabase
      .from('rating_systems')
      .select('*');
      
    if (error) throw error;
    return data as Tables['rating_systems'][];
  },
  
  // Get a specific rating system
  async getRatingSystemById(id: number) {
    const { data, error } = await supabase
      .from('rating_systems')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data as Tables['rating_systems'];
  },
};

// List Rating Settings Services
export const listRatingSettingsService = {
  // Get rating settings for a list
  async getListRatingSettings(listId: string) {
    const { data, error } = await supabase
      .from('list_rating_settings')
      .select('*')
      .eq('list_id', listId)
      .single();
      
    if (error) throw error;
    return data as Tables['list_rating_settings'];
  },
  
  // Create list rating settings
  async createListRatingSettings(settings: Tables['list_rating_settings']) {
    const { data, error } = await supabase
      .from('list_rating_settings')
      .insert(settings)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['list_rating_settings'];
  },
  
  // Update list rating settings
  async updateListRatingSettings(listId: string, updates: Partial<Tables['list_rating_settings']>) {
    const { data, error } = await supabase
      .from('list_rating_settings')
      .update(updates)
      .eq('list_id', listId)
      .select()
      .single();
      
    if (error) throw error;
    return data as Tables['list_rating_settings'];
  },
};

// Field Types Services
export const fieldTypeService = {
  // Get all field types
  async getFieldTypes() {
    const { data, error } = await supabase
      .from('field_types')
      .select('*');
      
    if (error) throw error;
    return data as Tables['field_types'][];
  },
};
