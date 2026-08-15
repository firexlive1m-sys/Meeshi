const fs = require('fs');

let content = fs.readFileSync('src/pages/Download.tsx', 'utf8');

const replacement = `
          {loginError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {loginError}
            </div>
          )}
          
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="Enter your purchase email"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading || cooldown > 0}
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (cooldown > 0 ? \`Wait \${cooldown}s\` : 'Send OTP')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-left">
                <label className="block text-sm font-medium text-gray-300 mb-1">Enter OTP</label>
                <input 
                  type="text" 
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value.replace(/\\D/g, '').slice(0, 6))}
                  placeholder="6-digit code"
                  className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors text-center text-xl tracking-widest font-mono"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loginLoading || otpInput.length !== 6}
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={cooldown > 0 || loginLoading}
                className="w-full text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {cooldown > 0 ? \`Resend OTP in \${cooldown}s\` : 'Resend OTP'}
              </button>
            </form>
          )}`;

content = content.replace(/<button\s*onClick=\{handleLogin\}[\s\S]*?Continue with Google\s*<\/button>/m, replacement);

fs.writeFileSync('src/pages/Download.tsx', content);
