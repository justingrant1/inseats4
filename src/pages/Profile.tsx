import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

export default function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message.includes("API key")) {
            console.error("Supabase API key error:", sessionError);
            setError("Server configuration error. Please contact support with code: AUTH_API_ERROR");
            setLoading(false);
            return;
          }
          throw sessionError;
        }
        
        if (!session) {
          navigate("/login");
          return;
        }
        
        setUser(session.user);
        
        // Get profile data if it exists
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (error && error.code !== 'PGRST116') {
          // PGRST116 means no rows returned, which is fine for new users
          throw error;
        }
        
        if (data) {
          setFullName(data.full_name || '');
          setPhone(data.phone || '');
          setAvatarUrl(data.avatar_url || '');
        }
      } catch (error: any) {
        console.error('Error loading user profile:', error.message);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, [navigate]);

  async function updateProfile(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setUpdating(true);
    
    try {
      if (!user) throw new Error("No user found");
      
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      // Insert or update profile
      const profileData = {
        id: user.id,
        full_name: fullName,
        phone,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', user.id);
        
        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase
          .from('profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);
        
        if (error) throw error;
      }
      
      setSuccess("Profile updated successfully");
    } catch (error: any) {
      setError(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl pt-32 pb-16 px-4 text-center">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl pt-32 pb-16 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl font-bold">My Profile</CardTitle>
              <CardDescription>{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={updateProfile} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL</Label>
              <Input
                id="avatar"
                type="text"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter a URL for your profile picture
              </p>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={updating}
            >
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/login");
            }}
          >
            Sign Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
