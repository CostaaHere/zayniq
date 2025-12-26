import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Lightbulb,
  Sparkles,
  Loader2,
  TrendingUp,
  Bookmark,
  BookmarkCheck,
  Copy,
  Check,
  ChevronDown,
  Clock,
  Zap,
  Target,
  Image,
  CalendarDays,
  Trash2,
  RefreshCw,
  Save,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface ContentIdea {
  id?: string;
  title: string;
  description: string;
  viralScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  contentType: string;
  keyPoints: string[];
  thumbnailConcept: string;
  bestPostingTime: string;
  niche?: string;
  scheduledDate?: Date;
}

interface TrendingTopic {
  topic: string;
  relevance: 'High' | 'Medium' | 'Low';
}

const NICHES = [
  'Gaming',
  'Technology',
  'Lifestyle',
  'Education',
  'Finance',
  'Health & Fitness',
  'Entertainment',
  'Food & Cooking',
  'Travel',
  'Fashion & Beauty',
  'Music',
  'Sports',
  'DIY & Crafts',
  'Business',
];

const CONTENT_STYLES = [
  { id: 'tutorial', label: 'Tutorial' },
  { id: 'review', label: 'Review' },
  { id: 'vlog', label: 'Vlog' },
  { id: 'list', label: 'List/Ranking' },
  { id: 'challenge', label: 'Challenge' },
  { id: 'story', label: 'Story/Documentary' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'comparison', label: 'Comparison' },
];

export default function ContentIdeasGenerator() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('generate');
  const [customTopic, setCustomTopic] = useState('');
  const [niche, setNiche] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [contentStyles, setContentStyles] = useState<string[]>([]);
  const [includeTrending, setIncludeTrending] = useState(true);
  const [numberOfIdeas, setNumberOfIdeas] = useState([10]);
  const [isLoading, setIsLoading] = useState(false);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [savedIdeas, setSavedIdeas] = useState<ContentIdea[]>([]);
  const [expandedIdeas, setExpandedIdeas] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [schedulingIdea, setSchedulingIdea] = useState<ContentIdea | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (user) {
      fetchSavedIdeas();
    }
  }, [user]);

  const fetchSavedIdeas = async () => {
    if (!user) return;
    setLoadingSaved(true);
    try {
      const { data, error } = await supabase
        .from('saved_content_ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setSavedIdeas(
        (data || []).map((item) => ({
          id: item.id,
          title: item.title,
          description: item.description || '',
          viralScore: item.viral_score || 0,
          difficulty: (item.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          contentType: item.content_type || '',
          keyPoints: (item.key_points as string[]) || [],
          thumbnailConcept: item.thumbnail_concept || '',
          bestPostingTime: item.best_posting_time || '',
          niche: item.niche || '',
          scheduledDate: item.scheduled_date ? new Date(item.scheduled_date) : undefined,
        }))
      );
    } catch (error) {
      console.error('Error fetching saved ideas:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleGenerate = async () => {
    const topic = customTopic.trim() || niche;
    if (!topic) {
      toast.error('Please enter a topic or select a niche');
      return;
    }

    setIsLoading(true);
    setIdeas([]);
    try {
      const { data, error } = await supabase.functions.invoke('generate-content-ideas', {
        body: {
          topic: customTopic.trim() || undefined,
          niche: customTopic.trim() ? undefined : niche,
          targetAudience,
          contentStyles,
          includeTrending,
          numberOfIdeas: numberOfIdeas[0],
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setIdeas(data.ideas || []);
      setTrendingTopics(data.trendingTopics || []);
      toast.success(`Generated ${data.ideas?.length || 0} ideas!`);
    } catch (error: any) {
      console.error('Error generating ideas:', error);
      toast.error(error.message || 'Failed to generate ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIdea = async (idea: ContentIdea, index: number) => {
    if (!user) return;
    setSavingId(index);
    try {
      const { error } = await supabase.from('saved_content_ideas').insert({
        user_id: user.id,
        title: idea.title,
        description: idea.description,
        viral_score: idea.viralScore,
        difficulty: idea.difficulty,
        content_type: idea.contentType,
        key_points: idea.keyPoints,
        thumbnail_concept: idea.thumbnailConcept,
        best_posting_time: idea.bestPostingTime,
        niche: customTopic.trim() || niche || idea.niche,
      });

      if (error) throw error;
      toast.success('Idea saved!');
      fetchSavedIdeas();
    } catch (error: any) {
      console.error('Error saving idea:', error);
      toast.error('Failed to save idea');
    } finally {
      setSavingId(null);
    }
  };

  const handleDeleteSavedIdea = async (id: string) => {
    try {
      const { error } = await supabase.from('saved_content_ideas').delete().eq('id', id);
      if (error) throw error;
      toast.success('Idea removed');
      fetchSavedIdeas();
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  };

  const handleScheduleIdea = async () => {
    if (!schedulingIdea?.id || !selectedDate) return;
    try {
      const { error } = await supabase
        .from('saved_content_ideas')
        .update({ scheduled_date: format(selectedDate, 'yyyy-MM-dd') })
        .eq('id', schedulingIdea.id);

      if (error) throw error;
      toast.success('Idea scheduled!');
      setSchedulingIdea(null);
      setSelectedDate(undefined);
      fetchSavedIdeas();
    } catch (error) {
      console.error('Error scheduling idea:', error);
      toast.error('Failed to schedule idea');
    }
  };

  const handleSaveAll = async () => {
    if (!user || ideas.length === 0) return;
    setIsLoading(true);
    try {
      const currentTopic = customTopic.trim() || niche;
      const inserts = ideas.map((idea) => ({
        user_id: user.id,
        title: idea.title,
        description: idea.description,
        viral_score: idea.viralScore,
        difficulty: idea.difficulty,
        content_type: idea.contentType,
        key_points: idea.keyPoints,
        thumbnail_concept: idea.thumbnailConcept,
        best_posting_time: idea.bestPostingTime,
        niche: currentTopic || idea.niche,
      }));

      const { error } = await supabase.from('saved_content_ideas').insert(inserts);
      if (error) throw error;
      toast.success(`Saved ${ideas.length} ideas!`);
      fetchSavedIdeas();
    } catch (error) {
      console.error('Error saving all ideas:', error);
      toast.error('Failed to save ideas');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(index);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedIdeas);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedIdeas(newExpanded);
  };

  const toggleContentStyle = (styleId: string) => {
    setContentStyles((prev) =>
      prev.includes(styleId) ? prev.filter((s) => s !== styleId) : [...prev, styleId]
    );
  };

  const getViralScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (score >= 40) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500/20 text-green-400';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'Hard':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const scheduledIdeas = savedIdeas.filter((idea) => idea.scheduledDate);

  const renderIdeaCard = (idea: ContentIdea, index: number, isSaved = false) => (
    <Card key={isSaved ? idea.id : index} className="overflow-hidden group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-base leading-tight">{idea.title}</CardTitle>
            <CardDescription className="mt-1 line-clamp-2">{idea.description}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={cn('font-mono', getViralScoreColor(idea.viralScore))}>
              <Zap className="w-3 h-3 mr-1" />
              {idea.viralScore}
            </Badge>
            <Badge variant="outline" className={getDifficultyColor(idea.difficulty)}>
              {idea.difficulty}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <Badge variant="secondary">{idea.contentType}</Badge>
          {idea.niche && (
            <Badge variant="outline" className="text-xs">
              {idea.niche}
            </Badge>
          )}
          {idea.scheduledDate && (
            <Badge className="bg-primary/20 text-primary">
              <CalendarDays className="w-3 h-3 mr-1" />
              {format(idea.scheduledDate, 'MMM d')}
            </Badge>
          )}
        </div>
      </CardHeader>

      <Collapsible open={expandedIdeas.has(index)}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full rounded-none border-t border-border"
            onClick={() => toggleExpand(index)}
          >
            <span className="text-xs text-muted-foreground">
              {expandedIdeas.has(index) ? 'Hide Details' : 'Show Details'}
            </span>
            <ChevronDown
              className={cn('w-4 h-4 ml-2 transition-transform', expandedIdeas.has(index) && 'rotate-180')}
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4 border-t border-border">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="w-4 h-4 text-primary" />
                Key Points
              </div>
              <ul className="space-y-1 pl-6">
                {idea.keyPoints.map((point, i) => (
                  <li key={i} className="text-sm text-muted-foreground list-disc">
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Image className="w-4 h-4 text-primary" />
                Thumbnail Concept
              </div>
              <p className="text-sm text-muted-foreground">{idea.thumbnailConcept}</p>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">Best Time: {idea.bestPostingTime}</span>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <CardContent className="pt-0 pb-3">
        <div className="flex gap-2 flex-wrap">
          {!isSaved ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSaveIdea(idea, index)}
                disabled={savingId === index}
              >
                {savingId === index ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Bookmark className="w-4 h-4 mr-1" />
                )}
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(idea.title, index)}
              >
                {copiedId === index ? (
                  <Check className="w-4 h-4 mr-1" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                Copy
              </Button>
            </>
          ) : (
            <>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSchedulingIdea(idea)}
                  >
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Schedule
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={handleScheduleIdea}
                      disabled={!selectedDate}
                    >
                      Confirm Schedule
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(idea.title, index)}
              >
                <Copy className="w-4 h-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => idea.id && handleDeleteSavedIdea(idea.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout title="Content Ideas Generator">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Content Ideas</h1>
          <p className="text-muted-foreground">
            Generate viral video ideas tailored to your niche
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="generate" className="gap-2">
              <Sparkles className="w-4 h-4" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="saved" className="gap-2">
              <BookmarkCheck className="w-4 h-4" />
              Saved ({savedIdeas.length})
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendar ({scheduledIdeas.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                {/* Input Form */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      Generate Ideas
                    </CardTitle>
                    <CardDescription>
                      Configure your preferences to get personalized content ideas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Smart Topic Search Bar */}
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        Content Topic
                      </Label>
                      <div className="relative">
                        <Input
                          placeholder="e.g. Free Fire gameplay, AI tools for YouTube, Travel Pakistan vlogs..."
                          value={customTopic}
                          onChange={(e) => setCustomTopic(e.target.value)}
                          className="pl-10 h-12 text-base bg-background/50 border-primary/20 focus:border-primary/50 transition-all"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Type any topic freely, or select a niche below as fallback
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Niche (optional)</Label>
                        <Select value={niche} onValueChange={setNiche} disabled={!!customTopic.trim()}>
                          <SelectTrigger className={customTopic.trim() ? 'opacity-50' : ''}>
                            <SelectValue placeholder="Select a niche as fallback" />
                          </SelectTrigger>
                          <SelectContent>
                            {NICHES.map((n) => (
                              <SelectItem key={n} value={n}>
                                {n}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Target Audience</Label>
                        <Input
                          placeholder="e.g., Beginners, Young adults, Professionals"
                          value={targetAudience}
                          onChange={(e) => setTargetAudience(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Content Styles</Label>
                      <div className="flex flex-wrap gap-2">
                        {CONTENT_STYLES.map((style) => (
                          <div
                            key={style.id}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={style.id}
                              checked={contentStyles.includes(style.id)}
                              onCheckedChange={() => toggleContentStyle(style.id)}
                            />
                            <label
                              htmlFor={style.id}
                              className="text-sm cursor-pointer"
                            >
                              {style.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Include Trending Topics</Label>
                        <p className="text-xs text-muted-foreground">
                          Add current viral trends to ideas
                        </p>
                      </div>
                      <Switch
                        checked={includeTrending}
                        onCheckedChange={setIncludeTrending}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>Number of Ideas</Label>
                        <span className="text-sm font-medium">{numberOfIdeas[0]}</span>
                      </div>
                      <Slider
                        value={numberOfIdeas}
                        onValueChange={setNumberOfIdeas}
                        min={5}
                        max={20}
                        step={1}
                      />
                    </div>

                    <Button
                      onClick={handleGenerate}
                      disabled={isLoading || (!customTopic.trim() && !niche)}
                      className="w-full h-12 text-base font-semibold"
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
                {ideas.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">{ideas.length} Ideas Generated</h2>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={isLoading}>
                          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
                          Regenerate
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleSaveAll} disabled={isLoading}>
                          <Save className="w-4 h-4 mr-2" />
                          Save All
                        </Button>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {ideas.map((idea, index) => renderIdeaCard(idea, index))}
                    </div>
                  </div>
                )}

                {!isLoading && ideas.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                      <p className="text-muted-foreground">
                        Configure your preferences and generate content ideas
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Trending Sidebar */}
              <div className="space-y-4">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      Trending Topics
                    </CardTitle>
                    <CardDescription>
                      Current trends in your niche
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {trendingTopics.length > 0 ? (
                      <div className="space-y-3">
                        {trendingTopics.map((topic, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                          >
                            <span className="text-sm">{topic.topic}</span>
                            <Badge
                              variant="outline"
                              className={cn(
                                'text-xs',
                                topic.relevance === 'High' && 'border-green-500 text-green-500',
                                topic.relevance === 'Medium' && 'border-yellow-500 text-yellow-500',
                                topic.relevance === 'Low' && 'border-gray-500 text-gray-500'
                              )}
                            >
                              {topic.relevance}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Generate ideas to see trending topics
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {loadingSaved ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : savedIdeas.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {savedIdeas.map((idea, index) => renderIdeaCard(idea, index, true))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    No saved ideas yet. Generate and save ideas to see them here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            {scheduledIdeas.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Scheduled Content</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {scheduledIdeas
                    .sort((a, b) => (a.scheduledDate?.getTime() || 0) - (b.scheduledDate?.getTime() || 0))
                    .map((idea, index) => renderIdeaCard(idea, index, true))}
                </div>
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <CalendarDays className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    No scheduled content. Save ideas and schedule them to plan your content.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
