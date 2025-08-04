"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/components/providers/AppProvider";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

export default function ContactPage() {
  const { language } = useApp();

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Contact Information
        </h1>
        <p className="text-gray-600 mt-2">
          Get in touch with our support team for assistance
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Send Message</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first-name">First Name</Label>
                  <Input id="first-name" placeholder="John" />
                </div>
                <div>
                  <Label htmlFor="last-name">Last Name</Label>
                  <Input id="last-name" placeholder="Doe" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.doe@hospital.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+351 960 960 960" />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Write your message.."
                  rows={5}
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="bg-[#225384] hover:bg-[#1a4a6b]"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Contact Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">Phone</h4>
                  <p className="text-sm text-gray-600">+351 912 135 981</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <p className="text-sm text-gray-600">
                    goncalo.silva@chporto.min-saude.pt
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-[#225384] mt-1" />
                <div>
                  <h4 className="font-medium">Address</h4>
                  <p className="text-sm text-gray-600">
                    Largo Professor Abel Salazar
                    <br />
                    4099-001 Porto
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Direct Support Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#225384]">
              Contact for direct support
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                className="border-blue-500 text-blue-600 hover:bg-blue-50"
              >
                Chat on WhatsApp
              </Button>
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">WhatsApp</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
