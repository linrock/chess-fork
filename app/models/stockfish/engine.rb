require 'open3'

module Stockfish

  class InvalidCommand < StandardError; end
  class InvalidOption < StandardError; end

  # Example invocations
  #
  # > engine = Stockfish::Engine.new
  # > position = "rqb2rk1/1p3p2/p1nb1n1p/2pp4/2P4Q/N2P1N2/PP2BPPP/R4RK1 w - - 1 15"
  # > puts engine.analyze position, { :nodes => 100000 }
  # > puts engine.analyze position, { :movetime => 2000 }
  # > puts engine.analyze position, { :depth => 10 }
  #
  class Engine
    attr_reader :stdin, :stdout, :stderr, :wait_threads, :version, :pid

    COMMANDS = %w( uci isready setoption ucinewgame position go stop ponderhit quit )

    def initialize(bin_path = "/usr/local/bin/stockfish")
      @stdin, @stdout, @stderr, @wait_threads = Open3.popen3(bin_path)
      @pid = @wait_threads[:pid]
      @version = @stdout.readline.strip
      raise "Not a valid Stockfish binary!" unless @version =~ /^Stockfish/
    end

    def execute(str)
      command = str.split(" ")[0]
      @stdin.puts str
      raise InvalidCommand.new(@stdout.readline.strip) unless COMMANDS.include?(command)
      output = ""
      case command
      when "uci"
        loop do
          output << (line = @stdout.readline)
          break if line =~ /^uciok/
        end
      when "go"
        loop do
          output << (line = @stdout.readline)
          break if line =~ /^bestmove/
        end
      when "setoption"
        sleep 0.05
        raise InvalidOption.new(@stdout.readline.strip) if @stdout.ready?
      when "isready"
        output << @stdout.readline
      end
      output
    end

    def ready?
      execute("isready").strip == "readyok"
    end

    def running?
      @wait_threads.alive?
    end

    def analyze(fen, options)
      execute "position fen #{fen}"
      %w( depth movetime nodes ).each do |command|
        if (x = options[command.to_sym])
          return execute "go #{command} #{x}"
        end
      end
    end

  end
end
