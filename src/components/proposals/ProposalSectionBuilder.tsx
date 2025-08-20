import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Trash2, GripVertical, FileText, Target, 
  Clock, DollarSign, FileCheck, ChevronUp, ChevronDown,
  Image, Video, Type, Heading1, Heading2, AlignLeft
} from 'lucide-react';
import MediaUploader from '../MediaUploader';

interface ContentBlock {
  id: string;
  type: 'text' | 'heading' | 'subheading' | 'image' | 'video';
  content: string;
  metadata?: {
    level?: number; // for headings
    url?: string; // for images/videos
    caption?: string; // for images/videos
    alignment?: 'left' | 'center' | 'right';
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
            Build your proposal with professional sections. Drag to reorder, click to edit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
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

          <div className="space-y-4">
            {sections.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sections added yet. Choose a section type above to get started.</p>
              </div>
            ) : (
              sections
                .sort((a, b) => a.order - b.order)
                .map((section, index) => (
                  <Card key={section.id} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(section.id, 'up')}
                              disabled={index === 0}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveSection(section.id, 'down')}
                              disabled={index === sections.length - 1}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <Badge variant="secondary" className="gap-1">
                            {getSectionIcon(section.type)}
                            {section.type}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(section.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      {/* Items for deliverables and timeline sections */}
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

                          <div className="space-y-3">
                            {section.items?.map((item) => (
                              <Card key={item.id} className="p-4">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Input
                                      placeholder="Item title"
                                      value={item.title}
                                      onChange={(e) => updateItem(section.id, item.id, { title: e.target.value })}
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeItem(section.id, item.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                  
                                  <Textarea
                                    placeholder="Item description"
                                    value={item.description}
                                    onChange={(e) => updateItem(section.id, item.id, { description: e.target.value })}
                                    rows={2}
                                  />

                                  {section.type === 'timeline' && (
                                    <Input
                                      placeholder="Timeline (e.g., Week 1-2)"
                                      value={item.timeline || ''}
                                      onChange={(e) => updateItem(section.id, item.id, { timeline: e.target.value })}
                                    />
                                  )}

                                  {section.type === 'deliverables' && (
                                    <Input
                                      placeholder="Cost (optional)"
                                      type="number"
                                      value={item.cost || ''}
                                      onChange={(e) => updateItem(section.id, item.id, { cost: parseFloat(e.target.value) || 0 })}
                                    />
                                  )}
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalSectionBuilder;