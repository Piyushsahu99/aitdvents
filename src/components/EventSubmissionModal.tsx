import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Calendar, MapPin, Link, Tag, Upload, Users, Coins, Image } from 'lucide-react';
import { POINT_VALUES } from '@/hooks/useEarnCoins';

interface EventSubmissionModalProps {
  onSuccess?: () => void;
}

const categories = [
  'Workshop',
  'Hackathon', 
  'Webinar',
  'Competition',
  'Meetup',
  'Conference',
  'Bootcamp',
  'Other'
];

export const EventSubmissionModal = ({ onSuccess }: EventSubmissionModalProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    category: '',
    external_link: '',
    organizer_name: '',
    expected_participants: '',
    is_online: true,
    is_free: true,
  });

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Poster size must be less than 5MB');
        return;
      }
      setPosterFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.date || !formData.location || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Please login to submit an event');
        return;
      }

      let posterUrl = null;
      
      // Upload poster if provided
      if (posterFile) {
        const fileExt = posterFile.name.split('.').pop();
        const fileName = `event-posters/${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-posters')
          .upload(fileName, posterFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('event-posters')
            .getPublicUrl(fileName);
          posterUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('events')
        .insert({
          title: formData.title.trim(),
          description: formData.description.trim() + (formData.organizer_name ? `\n\nOrganized by: ${formData.organizer_name}` : ''),
          date: formData.date,
          location: formData.location.trim(),
          category: formData.category,
          external_link: formData.external_link.trim() || null,
          is_online: formData.is_online,
          is_free: formData.is_free,
          poster_url: posterUrl,
          participants: formData.expected_participants ? parseInt(formData.expected_participants) : null,
          status: 'draft',
          created_by: user.id,
          submitted_by_user: true,
        });

      if (error) throw error;

      toast.success(`Event submitted! You'll earn ${POINT_VALUES.EVENT_REGISTER} coins when approved.`);
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        category: '',
        external_link: '',
        organizer_name: '',
        expected_participants: '',
        is_online: true,
        is_free: true,
      });
      setPosterFile(null);
      setPosterPreview(null);
      onSuccess?.();
    } catch (error: any) {
      console.error('Error submitting event:', error);
      toast.error(error.message || 'Failed to submit event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Event
          <Badge variant="secondary" className="ml-1 bg-yellow-500/20 text-yellow-600 text-xs">
            +{POINT_VALUES.EVENT_REGISTER}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Submit an Event
            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
              <Coins className="w-3 h-3 mr-1" />
              +{POINT_VALUES.EVENT_REGISTER} coins
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Poster Upload */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Event Poster (Optional)
            </Label>
            <div className="flex items-center gap-4">
              {posterPreview ? (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                  <img src={posterPreview} alt="Poster preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => { setPosterFile(null); setPosterPreview(null); }}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="w-20 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                    className="hidden"
                  />
                </label>
              )}
              <p className="text-xs text-muted-foreground">
                Add a poster to make your event stand out! (Max 5MB)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={3}
              maxLength={1000}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="City, Venue or Online Platform"
              maxLength={200}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organizer_name">Organizer Name</Label>
              <Input
                id="organizer_name"
                value={formData.organizer_name}
                onChange={(e) => setFormData({ ...formData, organizer_name: e.target.value })}
                placeholder="Your name/org"
                maxLength={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expected_participants" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Expected Attendees
              </Label>
              <Input
                id="expected_participants"
                type="number"
                value={formData.expected_participants}
                onChange={(e) => setFormData({ ...formData, expected_participants: e.target.value })}
                placeholder="e.g., 100"
                min="1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="external_link" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Registration/Event Link
            </Label>
            <Input
              id="external_link"
              type="url"
              value={formData.external_link}
              onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="is_online"
                checked={formData.is_online}
                onCheckedChange={(checked) => setFormData({ ...formData, is_online: checked })}
              />
              <Label htmlFor="is_online" className="text-sm">Online Event</Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_free"
                checked={formData.is_free}
                onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
              />
              <Label htmlFor="is_free" className="text-sm">Free Event</Label>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            <p className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-yellow-500" />
              You'll earn <span className="font-semibold text-yellow-600">+{POINT_VALUES.EVENT_REGISTER} coins</span> when your event is approved!
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? 'Submitting...' : (
                <>
                  Submit
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-600 text-xs">
                    +{POINT_VALUES.EVENT_REGISTER}
                  </Badge>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
