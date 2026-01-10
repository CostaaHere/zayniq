import React, { useState, useCallback } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Copy, Check, X, Plus, GripVertical, AlertTriangle, Save } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface TagSet {
  broad: string[];
  specific: string[];
  longTail: string[];
}

const CATEGORIES = [
  'Entertainment',
  'Gaming',
  'Education',
  'How-to & Style',
  'Science & Technology',
  'Music',
  'Sports',
  'News & Politics',
  'Comedy',
  'Film & Animation',
  'Autos & Vehicles',
  'Pets & Animals',
  'Travel & Events',
];

const MAX_CHARS = 500;

export default function TagsGenerator() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<TagSet | null>(null);
  const [customTag, setCustomTag] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedComma, setCopiedComma] = useState(false);
  const [draggedTag, setDraggedTag] = useState<{ type: keyof TagSet; index: number } | null>(null);

  const getAllTags = useCallback(() => {
    if (!tags) return [];
    return [...tags.broad, ...tags.specific, ...tags.longTail];
  }, [tags]);

  const getTotalCharCount = useCallback(() => {
    const allTags = getAllTags();
    return allTags.join(',').length;
  }, [getAllTags]);

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error('Please enter a video title');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-tags', {
        body: { title, description, category },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setTags(data.tags);
      toast.success('Tags generated successfully!');
    } catch (error: any) {
      console.error('Error generating tags:', error);
      toast.error(error.message || 'Failed to generate tags');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTag = (type: keyof TagSet, index: number) => {
    if (!tags) return;
    setTags({
      ...tags,
      [type]: tags[type].filter((_, i) => i !== index),
    });
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim() || !tags) return;
    
    const newCharCount = getTotalCharCount() + customTag.length + 1;
    if (newCharCount > MAX_CHARS) {
      toast.error('Adding this tag would exceed the 500 character limit');
      return;
    }

    setTags({
      ...tags,
      specific: [...tags.specific, customTag.trim()],
    });
    setCustomTag('');
  };

  const handleDragStart = (type: keyof TagSet, index: number) => {
    setDraggedTag({ type, index });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetType: keyof TagSet, targetIndex: number) => {
    if (!draggedTag || !tags) return;

    const sourceList = [...tags[draggedTag.type]];
    const targetList = draggedTag.type === targetType ? sourceList : [...tags[targetType]];
    
    const [removed] = sourceList.splice(draggedTag.index, 1);
    
    if (draggedTag.type === targetType) {
      sourceList.splice(targetIndex, 0, removed);
      setTags({ ...tags, [draggedTag.type]: sourceList });
    } else {
      targetList.splice(targetIndex, 0, removed);
      setTags({
        ...tags,
        [draggedTag.type]: sourceList,
        [targetType]: targetList,
      });
    }
    
    setDraggedTag(null);
  };

  const copyAllTags = async () => {
    const allTags = getAllTags();
    await navigator.clipboard.writeText(allTags.join('\n'));
    setCopiedAll(true);
    toast.success('All tags copied!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const copyCommaSeparated = async () => {
    const allTags = getAllTags();
    await navigator.clipboard.writeText(allTags.join(', '));
    setCopiedComma(true);
    toast.success('Tags copied as comma-separated!');
    setTimeout(() => setCopiedComma(false), 2000);
  };

  const saveTagSet = () => {
    const allTags = getAllTags();
    
    try {
      const rawData = localStorage.getItem('savedTagSets');
      let savedSets: Array<{ id: number; title: string; tags: string[]; createdAt: string }> = [];
      
      if (rawData) {
        const parsed = JSON.parse(rawData);
        // Validate it's an array
        savedSets = Array.isArray(parsed) ? parsed : [];
      }
      
      savedSets.push({
        id: Date.now(),
        title: title,
        tags: allTags,
        createdAt: new Date().toISOString(),
      });
      
      localStorage.setItem('savedTagSets', JSON.stringify(savedSets));
      toast.success('Tag set saved for reuse!');
    } catch (error) {
      console.error('Failed to save tag set:', error);
      toast.error('Failed to save tag set. Please try again.');
      // Reset corrupted data
      localStorage.removeItem('savedTagSets');
    }
  };

  const charCount = getTotalCharCount();
  const charPercentage = (charCount / MAX_CHARS) * 100;
  const isNearLimit = charPercentage >= 80;
  const isOverLimit = charCount > MAX_CHARS;

  const renderTagSection = (type: keyof TagSet, label: string, colorClass: string) => {
    if (!tags) return null;
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">{label} ({tags[type].length})</Label>
        <div className="flex flex-wrap gap-2">
          {tags[type].map((tag, index) => (
            <div
              key={`${type}-${index}`}
              draggable
              onDragStart={() => handleDragStart(type, index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(type, index)}
              className="cursor-move"
            >
              <Badge
                variant="secondary"
                className={`${colorClass} flex items-center gap-1 py-1.5 px-3 text-sm`}
              >
                <GripVertical className="h-3 w-3 opacity-50" />
                {tag}
                <button
                  onClick={() => handleRemoveTag(type, index)}
                  className="ml-1 hover:bg-background/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout title="AI Tags Generator">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Tags Generator</h1>
          <p className="text-muted-foreground">
            Generate SEO-optimized tags for your YouTube videos
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Video Details
              </CardTitle>
              <CardDescription>
                Enter your video information to generate optimized tags
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Video Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter your video title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Video Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your video content..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isLoading || !title.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating Tags...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Tags
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Tags</CardTitle>
              <CardDescription>
                {tags ? (
                  <div className="flex items-center gap-4">
                    <span>{getAllTags().length} tags</span>
                    <span className={`flex items-center gap-1 ${isOverLimit ? 'text-destructive' : isNearLimit ? 'text-yellow-600' : ''}`}>
                      {(isNearLimit || isOverLimit) && <AlertTriangle className="h-4 w-4" />}
                      {charCount} / {MAX_CHARS} characters
                    </span>
                  </div>
                ) : (
                  'Your generated tags will appear here'
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tags ? (
                <>
                  {/* Character limit progress */}
                  <div className="space-y-1">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isOverLimit ? 'bg-destructive' : isNearLimit ? 'bg-yellow-500' : 'bg-primary'
                        }`}
                        style={{ width: `${Math.min(charPercentage, 100)}%` }}
                      />
                    </div>
                    {isNearLimit && !isOverLimit && (
                      <p className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Approaching character limit
                      </p>
                    )}
                    {isOverLimit && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Character limit exceeded! Remove some tags.
                      </p>
                    )}
                  </div>

                  {/* Tag sections */}
                  {renderTagSection('broad', 'Broad Tags', 'bg-primary/20 text-primary border-primary/30')}
                  {renderTagSection('specific', 'Specific Tags', 'bg-secondary')}
                  {renderTagSection('longTail', 'Long-tail Tags', 'bg-accent text-accent-foreground')}

                  {/* Add custom tag */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom tag..."
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTag()}
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleAddCustomTag}
                      disabled={!customTag.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={copyAllTags}>
                      {copiedAll ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy All
                    </Button>
                    <Button variant="outline" onClick={copyCommaSeparated}>
                      {copiedComma ? (
                        <Check className="h-4 w-4 mr-2" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      Copy Comma-Separated
                    </Button>
                    <Button variant="outline" onClick={saveTagSet}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Set
                    </Button>
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
                    Regenerate Tags
                  </Button>
                </>
              ) : isLoading ? (
                <div className="space-y-6">
                  {/* Skeleton for character limit */}
                  <div className="h-2 bg-muted/50 rounded-full animate-pulse" />
                  
                  {/* Skeleton for tag sections */}
                  {['Broad Tags', 'Specific Tags', 'Long-tail Tags'].map((label) => (
                    <div key={label} className="space-y-2">
                      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse" />
                      <div className="flex flex-wrap gap-2">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className="h-8 bg-muted/50 rounded-full animate-pulse"
                            style={{ width: `${60 + Math.random() * 60}px` }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Enter video details and click generate to create optimized tags</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
