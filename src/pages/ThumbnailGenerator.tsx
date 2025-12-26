import { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Image, 
  Sparkles, 
  Loader2, 
  Palette, 
  Type, 
  Layout, 
  Smile, 
  ExternalLink,
  Lightbulb,
  Eye,
  Zap,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ThumbnailConcept {
  title: string;
  mainText: string;
  secondaryText: string;
  colors: string[];
  composition: string;
  expression: string;
  bestFor: string;
}

const EMOTIONS = [
  { value: 'curiosity', label: 'Curiosity', icon: '🤔' },
  { value: 'excitement', label: 'Excitement', icon: '🎉' },
  { value: 'shock', label: 'Shock', icon: '😱' },
  { value: 'trust', label: 'Trust', icon: '🤝' },
  { value: 'fomo', label: 'FOMO', icon: '⚡' },
];

const STYLES = [
  { value: 'clean', label: 'Clean & Minimal' },
  { value: 'bold', label: 'Bold & Impactful' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'colorful', label: 'Colorful & Vibrant' },
];

const BEST_PRACTICES = [
  {
    icon: Eye,
    title: 'High Contrast',
    description: 'Use contrasting colors so text pops, even at small sizes',
  },
  {
    icon: Type,
    title: 'Less is More',
    description: 'Keep text to 3-4 words max for instant readability',
  },
  {
    icon: Smile,
    title: 'Show Faces',
    description: 'Close-up faces with emotions get 38% more clicks',
  },
  {
    icon: Zap,
    title: 'Bright Colors',
    description: 'Yellow, orange, and red thumbnails stand out in feeds',
  },
];

export default function ThumbnailGenerator() {
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [emotion, setEmotion] = useState('curiosity');
  const [style, setStyle] = useState('bold');
  const [isLoading, setIsLoading] = useState(false);
  const [concepts, setConcepts] = useState<ThumbnailConcept[] | null>(null);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-thumbnails', {
        body: { title, topic, emotion, style },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setConcepts(data.concepts);
      toast.success('Thumbnail ideas generated!');
    } catch (error: any) {
      console.error('Error generating thumbnails:', error);
      toast.error(error.message || 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const openCanvaWithTemplate = () => {
    window.open('https://www.canva.com/create/youtube-thumbnails/', '_blank');
  };

  return (
    <DashboardLayout title="AI Thumbnail Ideas">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Thumbnail Ideas</h1>
          <p className="text-muted-foreground">
            Generate click-worthy thumbnail concepts for your videos
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Input Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5 text-primary" />
                  Video Details
                </CardTitle>
                <CardDescription>
                  Tell us about your video to get personalized thumbnail ideas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="title">Video Title *</Label>
                    <Input
                      id="title"
                      placeholder="How I Made $10K in One Month..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="topic">Main Topic/Subject</Label>
                    <Input
                      id="topic"
                      placeholder="e.g., Online business, cooking, gaming..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Target Emotion</Label>
                    <Select value={emotion} onValueChange={setEmotion}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EMOTIONS.map((e) => (
                          <SelectItem key={e.value} value={e.value}>
                            <span className="flex items-center gap-2">
                              <span>{e.icon}</span>
                              <span>{e.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Style Preference</Label>
                    <Select value={style} onValueChange={setStyle}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STYLES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !title.trim()}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Ideas...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate Ideas
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Results */}
            {concepts && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">
                    {concepts.length} Thumbnail Concepts
                  </h2>
                  <Button variant="outline" size="sm" onClick={openCanvaWithTemplate}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create in Canva
                  </Button>
                </div>

                <div className="grid gap-4">
                  {concepts.map((concept, index) => (
                    <Card key={index} className="overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                                {index + 1}
                              </span>
                              {concept.title}
                            </CardTitle>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            <Target className="h-3 w-3 mr-1" />
                            {concept.bestFor}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Text Overlays */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Type className="h-4 w-4" />
                            Text Overlays
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <div className="px-3 py-2 bg-primary/10 rounded-lg border border-primary/20">
                              <span className="font-bold text-primary">{concept.mainText}</span>
                            </div>
                            {concept.secondaryText && (
                              <div className="px-3 py-2 bg-muted rounded-lg">
                                <span className="text-sm text-muted-foreground">{concept.secondaryText}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Separator />

                        {/* Color Scheme */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Palette className="h-4 w-4" />
                            Color Scheme
                          </div>
                          <div className="flex gap-2">
                            {concept.colors.map((color, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <div
                                  className="w-8 h-8 rounded-lg shadow-inner border border-border"
                                  style={{ backgroundColor: color }}
                                />
                                <span className="text-xs font-mono text-muted-foreground">
                                  {color}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Composition */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Layout className="h-4 w-4" />
                            Composition
                          </div>
                          <p className="text-sm">{concept.composition}</p>
                        </div>

                        {/* Expression */}
                        {concept.expression && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Smile className="h-4 w-4" />
                                Expression/Pose
                              </div>
                              <p className="text-sm">{concept.expression}</p>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Regenerate */}
                <Button
                  variant="secondary"
                  onClick={handleGenerate}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Regenerate Ideas
                </Button>
              </div>
            )}

            {!concepts && !isLoading && (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    Enter your video details and click generate to get thumbnail ideas
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Best Practices Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {BEST_PRACTICES.map((practice, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <practice.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{practice.title}</h4>
                      <p className="text-xs text-muted-foreground">{practice.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                    <ExternalLink className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">Create Your Thumbnail</h4>
                    <p className="text-xs text-muted-foreground">Use Canva's free templates</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                  onClick={openCanvaWithTemplate}
                >
                  Open Canva
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
