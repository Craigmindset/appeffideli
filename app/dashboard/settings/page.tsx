"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Phone, MapPin, Bell, Shield, Palette } from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    weeklyDigest: true,
  });

  const handleToggle = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information and profile picture
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src="/images/avatar.png" alt="Profile" />
              <AvatarFallback>UN</AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" size="sm">
                Change Photo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG or GIF. Max size 2MB
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                <User className="h-4 w-4 inline mr-2" />
                First Name
              </Label>
              <Input id="firstName" placeholder="John" defaultValue="John" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                <User className="h-4 w-4 inline mr-2" />
                Last Name
              </Label>
              <Input id="lastName" placeholder="Doe" defaultValue="Doe" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                <Mail className="h-4 w-4 inline mr-2" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                defaultValue="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                <Phone className="h-4 w-4 inline mr-2" />
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 800 000 0000"
                defaultValue="+234 800 000 0000"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">
                <MapPin className="h-4 w-4 inline mr-2" />
                Address
              </Label>
              <Input
                id="address"
                placeholder="Your address"
                defaultValue="Lagos, Nigeria"
              />
            </div>
          </div>

          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Bell className="h-5 w-5 inline mr-2" />
            Notifications
          </CardTitle>
          <CardDescription>
            Manage how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={settings.emailNotifications}
              onCheckedChange={() => handleToggle("emailNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications via SMS
              </p>
            </div>
            <Switch
              id="smsNotifications"
              checked={settings.smsNotifications}
              onCheckedChange={() => handleToggle("smsNotifications")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails">Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and offers
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={settings.marketingEmails}
              onCheckedChange={() => handleToggle("marketingEmails")}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="weeklyDigest">Weekly Digest</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly summary of your activity
              </p>
            </div>
            <Switch
              id="weeklyDigest"
              checked={settings.weeklyDigest}
              onCheckedChange={() => handleToggle("weeklyDigest")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Shield className="h-5 w-5 inline mr-2" />
            Security
          </CardTitle>
          <CardDescription>
            Manage your password and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input id="currentPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input id="newPassword" type="password" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input id="confirmPassword" type="password" />
          </div>

          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Palette className="h-5 w-5 inline mr-2" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Light
              </Button>
              <Button variant="outline" size="sm">
                Dark
              </Button>
              <Button variant="outline" size="sm">
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions - proceed with caution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
