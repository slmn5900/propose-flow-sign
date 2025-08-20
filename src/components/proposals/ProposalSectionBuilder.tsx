import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, Trash2, GripVertical, FileText, Target, 
  Clock, DollarSign, FileCheck, ChevronUp, ChevronDown,
  Image, Video, Type, Heading1, Heading2, AlignLeft, Link, 
  Eye, EyeOff, X
} from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'subheading' | 'image' | 'video' | 'link' | 'container';
  content: string;
  metadata?: {
    level?: number; // for headings
    url?: string; // for images/videos/links
    caption?: string; // for images/videos
    alignment?: 'left' | 'center' | 'right';
    link_text?: string; // for links
    container_type?: 'box' | 'card' | 'highlight'; // for containers
    children?: ContentBlock[]; // for containers
  };
}

interface Section {
  id: string;
  type: 'intro' | 'deliverables' | 'timeline' | 'pricing' | 'terms' | 'custom';
  title: string;
  content: string;
  order: number;
  content_blocks?: ContentBlock[];
  items?: Array<{
    id: string;
    title: string;
    description: string;
    timeline?: string;
    cost?: number;
  }>;
}

interface ProposalSectionBuilderProps {
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
}

const sectionTemplates = {
  intro: {
    title: 'Project Introduction',
    content: 'We are excited to present this proposal for your project. Our team has carefully analyzed your requirements and developed a comprehensive solution tailored to your specific needs.',
    icon: FileText,
  },
  deliverables: {
    title: 'Project Deliverables',
    content: 'The following deliverables will be provided as part of this project:',
    icon: Target,
  },
  timeline: {
    title: 'Project Timeline',
    content: 'Here is the proposed timeline for the project milestones:',
    icon: Clock,
  },
  pricing: {
    title: 'Investment & Pricing',
    content: 'Our pricing structure is designed to provide excellent value while ensuring project success:',
    icon: DollarSign,
  },
  terms: {
    title: 'Terms & Conditions',
    content: 'Please review the following terms and conditions for this proposal:',
    icon: FileCheck,
  },
  custom: {
    title: 'Custom Section',
    content: 'Add your custom content here...',
    icon: FileText,
  },
};

const ProposalSectionBuilder = ({ sections, onSectionsChange }: ProposalSectionBuilderProps) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [showMediaUploader, setShowMediaUploader] = useState<{ sectionId: string; type: 'image' | 'video' } | null>(null);

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = (type: keyof typeof sectionTemplates) => {
    const template = sectionTemplates[type];
    const newSection: Section = {
      id: `section_${Date.now()}`,
      type,
      title: template.title,
      content: template.content,
      order: sections.length,
      content_blocks: [],
      items: type === 'deliverables' || type === 'timeline' ? [] : undefined,
    };

    onSectionsChange([...sections, newSection]);
    setExpandedSections(prev => new Set([...prev, newSection.id]));
  };

  const updateSection = (id: string, updates: Partial<Section>) => {
    const updatedSections = sections.map(section =>
      section.id === id ? { ...section, ...updates } : section
    );
    onSectionsChange(updatedSections);
  };

  const removeSection = (id: string) => {
    const updatedSections = sections.filter(section => section.id !== id);
    onSectionsChange(updatedSections);
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const currentIndex = sections.findIndex(section => section.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newSections[currentIndex], newSections[targetIndex]] = [newSections[targetIndex], newSections[currentIndex]];
    
    // Update order numbers
    newSections.forEach((section, index) => {
      section.order = index;
    });

    onSectionsChange(newSections);
  };

  const addItem = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newItem = {
      id: `item_${Date.now()}`,
      title: '',
      description: '',
      timeline: section.type === 'timeline' ? '' : undefined,
      cost: section.type === 'deliverables' ? 0 : undefined,
    };

    updateSection(sectionId, {
      items: [...(section.items || []), newItem],
    });
  };

  const updateItem = (sectionId: string, itemId: string, updates: any) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.items) return;

    const updatedItems = section.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    updateSection(sectionId, { items: updatedItems });
  };

  const addContentBlock = (sectionId: string, type: ContentBlock['type']) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type,
      content: type === 'heading' ? 'New Heading' : type === 'subheading' ? 'New Subheading' : 'Add your content here...',
      metadata: type === 'heading' ? { level: 1 } : type === 'subheading' ? { level: 2 } : {},
    };

    updateSection(sectionId, {
      content_blocks: [...(section.content_blocks || []), newBlock],
    });
  };

  const updateContentBlock = (sectionId: string, blockId: string, updates: Partial<ContentBlock>) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.content_blocks) return;

    const updatedBlocks = section.content_blocks.map(block =>
      block.id === blockId ? { ...block, ...updates } : block
    );

    updateSection(sectionId, { content_blocks: updatedBlocks });
  };

  const removeContentBlock = (sectionId: string, blockId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.content_blocks) return;

    const updatedBlocks = section.content_blocks.filter(block => block.id !== blockId);
    updateSection(sectionId, { content_blocks: updatedBlocks });
  };

  const handleMediaUpload = (url: string, fileName: string) => {
    if (!showMediaUploader) return;

    const { sectionId, type } = showMediaUploader;
    addContentBlock(sectionId, type);
    
    // Update the last added block with the media URL
    const section = sections.find(s => s.id === sectionId);
    if (section && section.content_blocks) {
      const lastBlock = section.content_blocks[section.content_blocks.length - 1];
      updateContentBlock(sectionId, lastBlock.id, {
        content: fileName,
        metadata: { ...lastBlock.metadata, url }
      });
    }
    
    setShowMediaUploader(null);
  };

  const removeItem = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section || !section.items) return;

    const updatedItems = section.items.filter(item => item.id !== itemId);
    updateSection(sectionId, { items: updatedItems });
  };

  const getSectionIcon = (type: string) => {
    const template = sectionTemplates[type as keyof typeof sectionTemplates];
    const Icon = template?.icon || FileText;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Proposal Sections</CardTitle>
          <CardDescription>
            Build your proposal with professional sections. Click expand to edit, drag to reorder.
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[70vh] overflow-y-auto">
          {/* Sticky Action Bar */}
          <div className="flex flex-wrap gap-2 mb-6 sticky top-0 bg-background z-10 py-2 border-b">
            {Object.entries(sectionTemplates).map(([type, template]) => {
              const Icon = template.icon;
              return (
                <Button
                  key={type}
                  variant="outline"
                  size="sm"
                  onClick={() => addSection(type as keyof typeof sectionTemplates)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  Add {template.title}
                </Button>
              );
            })}
          </div>

          {/* Sections List */}
          <div className="space-y-4 pb-4">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sections added yet. Choose a section type above to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => {
                    const isExpanded = expandedSections.has(section.id);
                    return (
                      <Card key={section.id} className="relative border-l-4 border-l-primary/20">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveSection(section.id, 'up')}
                                  disabled={index === 0}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveSection(section.id, 'down')}
                                  disabled={index === sections.length - 1}
                                  className="h-8 w-8 p-0"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Badge variant="secondary" className="gap-1">
                                {getSectionIcon(section.type)}
                                {section.type}
                              </Badge>
                              <div className="font-medium">{section.title || 'Untitled Section'}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleSectionExpansion(section.id)}
                                className="h-8 w-8 p-0"
                              >
                                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSection(section.id)}
                                className="text-destructive hover:text-destructive h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        
                        {/* Expandable Content */}
                        {isExpanded && (
                          <CardContent className="space-y-4 border-t bg-muted/5">
                            {/* Basic Section Info */}
                            <div>
                              <label className="text-sm font-medium">Section Title</label>
                              <Input
                                value={section.title}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                placeholder="Section title"
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">Content</label>
                              <Textarea
                                value={section.content}
                                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                placeholder="Section content"
                                rows={3}
                              />
                            </div>

                            {/* Rich Content Builder */}
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">Rich Content</label>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addContentBlock(section.id, 'text')}
                                    className="gap-1"
                                  >
                                    <Type className="h-3 w-3" />
                                    Text
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addContentBlock(section.id, 'heading')}
                                    className="gap-1"
                                  >
                                    <Heading1 className="h-3 w-3" />
                                    Heading
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowMediaUploader({ sectionId: section.id, type: 'image' })}
                                    className="gap-1"
                                  >
                                    <Image className="h-3 w-3" />
                                    Image
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addContentBlock(section.id, 'link')}
                                    className="gap-1"
                                  >
                                    <Link className="h-3 w-3" />
                                    Link
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addContentBlock(section.id, 'container')}
                                    className="gap-1"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Container
                                  </Button>
                                </div>
                              </div>

                              {/* Content Blocks Display */}
                              {section.content_blocks && section.content_blocks.length > 0 && (
                                <div className="space-y-3 border rounded-lg p-3 bg-background max-h-60 overflow-y-auto">
                                  <div className="text-sm font-medium text-muted-foreground mb-2">
                                    Content Blocks ({section.content_blocks.length})
                                  </div>
                                  {section.content_blocks.map((block) => (
                                    <Card key={block.id} className="p-3 bg-muted/5">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Badge variant="outline" className="text-xs">{block.type}</Badge>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeContentBlock(section.id, block.id)}
                                            className="h-6 w-6 p-0"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        </div>

                                        {/* Different block type editors */}
                                        {block.type === 'text' && (
                                          <Textarea
                                            placeholder="Enter your text content..."
                                            value={block.content}
                                            onChange={(e) => updateContentBlock(section.id, block.id, { content: e.target.value })}
                                            rows={2}
                                            className="text-sm"
                                          />
                                        )}

                                        {(block.type === 'heading' || block.type === 'subheading') && (
                                          <div className="space-y-2">
                                            <Input
                                              placeholder="Heading text"
                                              value={block.content}
                                              onChange={(e) => updateContentBlock(section.id, block.id, { content: e.target.value })}
                                            />
                                            <Select
                                              value={block.metadata?.level?.toString() || '1'}
                                              onValueChange={(value) => updateContentBlock(section.id, block.id, {
                                                metadata: { ...block.metadata, level: parseInt(value) }
                                              })}
                                            >
                                              <SelectTrigger className="w-20 h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="1">H1</SelectItem>
                                                <SelectItem value="2">H2</SelectItem>
                                                <SelectItem value="3">H3</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}

                                        {block.type === 'image' && (
                                          <div className="space-y-2">
                                            {block.metadata?.url ? (
                                              <div className="space-y-2">
                                                <img 
                                                  src={block.metadata.url} 
                                                  alt={block.content} 
                                                  className="max-w-32 h-20 object-cover rounded border"
                                                />
                                                <Input
                                                  placeholder="Image caption"
                                                  value={block.metadata?.caption || ''}
                                                  onChange={(e) => updateContentBlock(section.id, block.id, {
                                                    metadata: { ...block.metadata, caption: e.target.value }
                                                  })}
                                                  className="text-xs h-8"
                                                />
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => updateContentBlock(section.id, block.id, {
                                                    metadata: { ...block.metadata, url: undefined }
                                                  })}
                                                  className="text-xs h-6"
                                                >
                                                  Remove
                                                </Button>
                                              </div>
                                            ) : (
                                              <Button
                                                variant="outline"
                                                onClick={() => setShowMediaUploader({ sectionId: section.id, type: 'image' })}
                                              >
                                                Upload Image
                                              </Button>
                                            )}
                                          </div>
                                        )}

                                        {block.type === 'link' && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              placeholder="Link text"
                                              value={block.metadata?.link_text || ''}
                                              onChange={(e) => updateContentBlock(section.id, block.id, {
                                                metadata: { ...block.metadata, link_text: e.target.value }
                                              })}
                                              className="text-xs h-8"
                                            />
                                            <Input
                                              placeholder="URL (https://...)"
                                              value={block.metadata?.url || ''}
                                              onChange={(e) => updateContentBlock(section.id, block.id, {
                                                metadata: { ...block.metadata, url: e.target.value }
                                              })}
                                              className="text-xs h-8"
                                            />
                                          </div>
                                        )}

                                        {block.type === 'container' && (
                                          <div className="grid grid-cols-2 gap-2">
                                            <Input
                                              placeholder="Container title"
                                              value={block.content}
                                              onChange={(e) => updateContentBlock(section.id, block.id, { content: e.target.value })}
                                              className="text-xs h-8"
                                            />
                                            <Select
                                              value={block.metadata?.container_type || 'box'}
                                              onValueChange={(value) => updateContentBlock(section.id, block.id, {
                                                metadata: { ...block.metadata, container_type: value as 'box' | 'card' | 'highlight' }
                                              })}
                                            >
                                              <SelectTrigger className="h-8">
                                                <SelectValue />
                                              </SelectTrigger>
                                              <SelectContent>
                                                <SelectItem value="box">Box</SelectItem>
                                                <SelectItem value="card">Card</SelectItem>
                                                <SelectItem value="highlight">Highlight</SelectItem>
                                              </SelectContent>
                                            </Select>
                                          </div>
                                        )}
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* Section Items for specific types */}
                            {(section.type === 'deliverables' || section.type === 'timeline') && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <label className="text-sm font-medium">Items</label>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addItem(section.id)}
                                    className="gap-2"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Item
                                  </Button>
                                </div>

                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                  {section.items?.map((item) => (
                                    <Card key={item.id} className="p-3 bg-muted/5">
                                      <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                          <Input
                                            placeholder="Item title"
                                            value={item.title}
                                            onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                                            className="flex-1 mr-2"
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeItem(section.id, item.id)}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                        
                                        <Textarea
                                          placeholder="Item description"
                                          value={item.description}
                                          onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                                          rows={2}
                                          className="text-sm"
                                        />

                                        {section.type === 'timeline' && (
                                          <Input
                                            placeholder="Timeline (e.g., Week 1-2)"
                                            value={item.timeline || ''}
                                            onChange={(e) => updateItem(section.id, item.id, { timeline: e.target.value })}
                                            className="text-sm"
                                          />
                                        )}

                                        {section.type === 'deliverables' && (
                                          <Input
                                            placeholder="Cost (optional)"
                                            type="number"
                                            value={item.cost || ''}
                                            onChange={(e) => updateItem(section.id, item.id, { cost: parseFloat(e.target.value) || 0 })}
                                            className="text-sm"
                                          />
                                        )}
                                      </div>
                                    </Card>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Media Uploader Modal */}
      {showMediaUploader && (
        <Dialog open={true} onOpenChange={() => setShowMediaUploader(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload {showMediaUploader.type}</DialogTitle>
              <DialogDescription>
                Select and upload {showMediaUploader.type} files for your proposal section.
              </DialogDescription>
            </DialogHeader>
            <MediaUploader
              bucketName={showMediaUploader.type === 'image' ? 'proposal-images' : 'proposal-videos'}
              acceptedTypes={showMediaUploader.type === 'image' ? 'image/*' : 'video/*'}
              onUploadSuccess={handleMediaUpload}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ProposalSectionBuilder;