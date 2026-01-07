import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Award, 
  Pencil, 
  Trash2, 
  Eye,
  FileText,
  Download
} from "lucide-react";
import { format } from "date-fns";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string | null;
  template_type: string;
  background_color: string;
  primary_color: string;
  logo_url: string | null;
  badge_url: string | null;
  is_active: boolean;
  created_at: string;
}

interface IssuedCertificate {
  id: string;
  certificate_number: string;
  recipient_name: string;
  recipient_email: string;
  issue_date: string;
  is_valid: boolean;
  template_id: string | null;
}

const CertificateTemplateManager = () => {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuedCertificates, setIssuedCertificates] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    template_type: "event",
    background_color: "#ffffff",
    primary_color: "#7c3aed",
    is_active: true
  });

  useEffect(() => {
    fetchTemplates();
    fetchIssuedCertificates();
  }, []);

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("certificate_templates")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTemplates(data);
    setLoading(false);
  };

  const fetchIssuedCertificates = async () => {
    const { data } = await supabase
      .from("issued_certificates")
      .select("*")
      .order("issue_date", { ascending: false })
      .limit(100);
    if (data) setIssuedCertificates(data);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Template name is required", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (editingTemplate) {
      const { error } = await supabase
        .from("certificate_templates")
        .update({
          name: formData.name,
          description: formData.description || null,
          template_type: formData.template_type,
          background_color: formData.background_color,
          primary_color: formData.primary_color,
          is_active: formData.is_active
        })
        .eq("id", editingTemplate.id);

      if (error) {
        toast({ title: "Failed to update template", variant: "destructive" });
      } else {
        toast({ title: "Template updated successfully" });
      }
    } else {
      const { error } = await supabase
        .from("certificate_templates")
        .insert({
          name: formData.name,
          description: formData.description || null,
          template_type: formData.template_type,
          background_color: formData.background_color,
          primary_color: formData.primary_color,
          is_active: formData.is_active,
          created_by: user?.id
        });

      if (error) {
        toast({ title: "Failed to create template", variant: "destructive" });
      } else {
        toast({ title: "Template created successfully" });
      }
    }

    setModalOpen(false);
    resetForm();
    fetchTemplates();
  };

  const handleEdit = (template: CertificateTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || "",
      template_type: template.template_type,
      background_color: template.background_color,
      primary_color: template.primary_color,
      is_active: template.is_active
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    const { error } = await supabase
      .from("certificate_templates")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to delete template", variant: "destructive" });
    } else {
      toast({ title: "Template deleted" });
      fetchTemplates();
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("certificate_templates")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (!error) {
      fetchTemplates();
    }
  };

  const handleRevokeCertificate = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this certificate?")) return;

    const { error } = await supabase
      .from("issued_certificates")
      .update({ is_valid: false })
      .eq("id", id);

    if (error) {
      toast({ title: "Failed to revoke certificate", variant: "destructive" });
    } else {
      toast({ title: "Certificate revoked" });
      fetchIssuedCertificates();
    }
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      description: "",
      template_type: "event",
      background_color: "#ffffff",
      primary_color: "#7c3aed",
      is_active: true
    });
  };

  const exportCertificates = () => {
    const csv = [
      ["Certificate Number", "Recipient Name", "Email", "Issue Date", "Status"].join(","),
      ...issuedCertificates.map(cert => [
        cert.certificate_number,
        `"${cert.recipient_name}"`,
        cert.recipient_email,
        format(new Date(cert.issue_date), "yyyy-MM-dd"),
        cert.is_valid ? "Valid" : "Revoked"
      ].join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificates-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="issued" className="gap-2">
            <Award className="w-4 h-4" /> Issued Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Certificate Templates</h3>
            <Dialog open={modalOpen} onOpenChange={(open) => {
              setModalOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" /> Add Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingTemplate ? "Edit Template" : "Create Template"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Template Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Event Participation Certificate"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Template description..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.template_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="course">Course</SelectItem>
                        <SelectItem value="membership">Membership</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.background_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.background_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, background_color: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={formData.primary_color}
                          onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label>Active</Label>
                    <Switch
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                  </div>

                  <Button onClick={handleSubmit} className="w-full">
                    {editingTemplate ? "Update Template" : "Create Template"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading templates...</div>
          ) : templates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No templates created yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant="outline" className="mt-1">{template.template_type}</Badge>
                      </div>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={() => handleToggleActive(template.id, template.is_active)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mb-3">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: template.background_color }}
                        title="Background"
                      />
                      <div
                        className="w-8 h-8 rounded border"
                        style={{ backgroundColor: template.primary_color }}
                        title="Primary"
                      />
                    </div>
                    {template.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {template.description}
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(template)}>
                        <Pencil className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(template.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="issued" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Issued Certificates ({issuedCertificates.length})</h3>
            <Button variant="outline" onClick={exportCertificates} className="gap-2">
              <Download className="w-4 h-4" /> Export CSV
            </Button>
          </div>

          {issuedCertificates.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-8 text-center">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates issued yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Certificate ID</TableHead>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Issue Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {issuedCertificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell className="font-mono text-sm">{cert.certificate_number}</TableCell>
                      <TableCell>{cert.recipient_name}</TableCell>
                      <TableCell>{cert.recipient_email}</TableCell>
                      <TableCell>{format(new Date(cert.issue_date), "PPP")}</TableCell>
                      <TableCell>
                        {cert.is_valid ? (
                          <Badge className="bg-green-500">Valid</Badge>
                        ) : (
                          <Badge variant="destructive">Revoked</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/certificates?verify=true&code=${cert.certificate_number}`, "_blank")}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          {cert.is_valid && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRevokeCertificate(cert.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CertificateTemplateManager;